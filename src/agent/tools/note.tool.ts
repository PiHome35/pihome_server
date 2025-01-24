import { Tool } from '@langchain/core/tools';
import { MongoService } from '../../database/mongo.service';
import { Note } from '../interfaces/note.interface';
import { Collection } from 'mongodb';

export class NoteTool extends Tool {
  name = 'note';

  description =
    'Save and search notes. Commands: "save: <userId>:<content> [private]" to save a note (add private flag for private notes), or "search: <userId>:<query>" to search notes';

  private collection: Collection<Note>;

  constructor(private mongoService: MongoService) {
    super();
    this.collection = this.mongoService.getDb().collection<Note>('notes');
  }

  private extractTags(content: string): string[] {
    const tagRegex = /#(\w+)/g;
    const matches = content.match(tagRegex) || [];
    return matches.map((tag) => tag.slice(1));
  }

  private async getUserContext(userId: string) {
    // In a real application, this would fetch user details from the database
    // For now, using mock data
    return {
      userId,
      userName: `User ${userId}`,
      familyId: 'default-family',
      familyName: 'Default Family',
    };
  }

  private async saveNote(userId: string, content: string, isPrivate: boolean): Promise<string> {
    const tags = this.extractTags(content);
    const context = await this.getUserContext(userId);

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
  }

  private async searchNotes(userId: string, query: string): Promise<string> {
    const context = await this.getUserContext(userId);

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
  }

  protected async _call(input: string): Promise<string> {
    try {
      const [command, ...rest] = input.split(':').map((str) => str.trim());

      if (!command || rest.length < 2) {
        throw new Error('Invalid format. Use "save: userId:content" or "search: userId:query"');
      }

      const userId = rest[0];
      const content = rest.slice(1).join(':').trim();

      if (!userId || !content) {
        throw new Error('Both userId and content are required');
      }

      switch (command.toLowerCase()) {
        case 'save': {
          const isPrivate = content.toLowerCase().endsWith('private');
          const noteContent = isPrivate ? content.slice(0, -7).trim() : content;
          return this.saveNote(userId, noteContent, isPrivate);
        }
        case 'search':
          return this.searchNotes(userId, content);
        default:
          throw new Error('Unknown command. Use "save: userId:content [private]" or "search: userId:query"');
      }
    } catch (error) {
      throw new Error(`Error with note operation: ${error.message}`);
    }
  }
}
