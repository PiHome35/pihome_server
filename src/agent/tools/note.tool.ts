import { Injectable } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { MongoService } from '../../database/mongo.service';
import { Note } from '../interfaces/note.interface';
import { Collection } from 'mongodb';
import { UsersService } from 'src/pihome/services/users.service';

@Injectable()
export class NoteTool {
  private collection: Collection<Note>;
  private familyId: string;

  constructor(
    private mongoService: MongoService,
    private usersService: UsersService,
  ) {
    this.collection = this.mongoService.getDb().collection<Note>('notes');
  }

  setFamilyId(familyId: string) {
    this.familyId = familyId;
    return this;
  }

  private extractTags(content: string): string[] {
    const tagRegex = /#(\w+)/g;
    const matches = content.match(tagRegex) || [];
    return matches.map((tag) => tag.slice(1));
  }

  private async getUserContext(userId: string, familyId: string) {
    try {
      const user = await this.usersService.getUser(userId);
      const family = await this.usersService.getUserFamily(userId);

      return {
        userId: user.id,
        userName: user.name,
        familyId: family.id,
        familyName: family.name,
      };
    } catch (error) {
      throw new Error('User or family not found');
    }
  }

  private saveNoteSchema = z.object({
    userId: z.string().describe('The ID of the user saving the note'),
    content: z.string().describe('The content of the note'),
    isPrivate: z.boolean().describe('Whether the note is private'),
  });

  private searchNotesSchema = z.object({
    userId: z.string().describe('The ID of the user searching for notes'),
    query: z.string().describe('The search query for finding notes'),
  });

  saveNote = tool(
    async (input: z.infer<typeof this.saveNoteSchema>) => {
      const { userId, content, isPrivate = false } = input;
      const tags = this.extractTags(content);
      const context = await this.getUserContext(userId, this.familyId);

      const note: Note = {
        content,
        tags,
        userId: context.userId,
        userName: context.userName,
        familyId: context.familyId,
        familyName: context.familyName,
        isPrivate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await this.collection.insertOne(note);
      const visibility = isPrivate ? 'private' : 'family-visible';
      return `Note saved successfully with ID: ${result.insertedId}. Tags: ${
        tags.length ? tags.join(', ') : 'none'
      }. Visibility: ${visibility}`;
    },
    {
      name: 'saveNote',
      description: 'Save a note for a user. Can be marked as private.',
      schema: this.saveNoteSchema,
    },
  );

  searchNotes = tool(
    async (input: z.infer<typeof this.searchNotesSchema>) => {
      const { userId, query } = input;
      const context = await this.getUserContext(userId, this.familyId);

      const notes = await this.collection
        .find({
          $and: [
            { familyId: context.familyId },
            { $or: [{ isPrivate: false }, { userId: context.userId }] },
            {
              $or: [{ content: { $regex: query, $options: 'i' } }, { tags: { $in: [query.toLowerCase()] } }],
            },
          ],
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

      if (notes.length === 0) {
        return 'No notes found for this query.';
      }

      const formattedNotes = notes
        .map((note, index) => {
          const visibility = note.isPrivate ? '🔒 Private' : '👨‍👩‍👧‍👦 Family';
          const author = note.userId === context.userId ? 'You' : note.userName;
          const tags = note.tags.length ? `[Tags: ${note.tags.join(', ')}]` : '';
          return `${index + 1}. ${note.content} (By: ${author}) ${tags} ${visibility}`;
        })
        .join('\n');

      return `Found ${notes.length} notes:\n${formattedNotes}`;
    },
    {
      name: 'searchNotes',
      description: 'Search for notes by content or tags',
      schema: this.searchNotesSchema,
    },
  );
}
