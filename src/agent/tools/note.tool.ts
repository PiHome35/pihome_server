import { Injectable } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { MongoService } from '../../database/mongo.service';
import { Note } from '../interfaces/note.interface';
import { Collection, ObjectId } from 'mongodb';
import { UsersService } from 'src/pihome/services/users.service';

@Injectable()
export class NoteTool {
  private collection: Collection<Note>;
  private familyId: string;
  private userId: string;
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

  setUserId(userId: string) {
    this.userId = userId;
    return this;
  }

  getAllTools(familyId: string, userId: string) {
    this.setFamilyId(familyId);
    this.setUserId(userId);
    return [
      this.saveNote,
      this.searchNotes,
      this.updateNote,
      this.deleteNote,
      this.getAllTags,
      this.getAllCategories,
      this.getAllNotes,
    ];
  }

  private commonTags = new Set([
    // English common tags
    'important', 'urgent', 'todo', 'reminder', 'idea', 'work', 'personal', 'shopping',
    // Thai common tags
    'สำคัญ', 'ด่วน', 'ต้องทำ', 'เตือน', 'ไอเดีย', 'งาน', 'ส่วนตัว', 'ช็อปปิ้ง'
  ]);

  private commonCategories = new Set([
    // English categories
    'work', 'home', 'shopping', 'health', 'finance', 'family', 'travel',
    // Thai categories
    'งาน', 'บ้าน', 'ช็อปปิ้ง', 'สุขภาพ', 'การเงิน', 'ครอบครัว', 'ท่องเที่ยว'
  ]);

  private extractTags(content: string): string[] {
    const tags = new Set<string>();
    
    // Extract explicit hashtags
    const hashtagRegex = /#([\w\u0E00-\u0E7F]+(?:\s+[\w\u0E00-\u0E7F]+)*)/g;
    const hashtagMatches = [...(content.matchAll(hashtagRegex))];
    hashtagMatches.forEach(match => tags.add(match[1].toLowerCase().trim()));

    // Extract common tags from content
    const words = content.toLowerCase().match(/[\w\u0E00-\u0E7F]+/g) || [];
    words.forEach(word => {
      if (this.commonTags.has(word)) {
        tags.add(word);
      }
    });

    return Array.from(tags);
  }

  private extractCategory(content: string): string | undefined {
    // First try explicit @category
    const categoryRegex = /@([\w\u0E00-\u0E7F]+(?:\s+[\w\u0E00-\u0E7F]+)*)/;
    const match = content.match(categoryRegex);
    if (match) return match[1].toLowerCase().trim();

    // Then look for common categories in the content
    const words = content.toLowerCase().match(/[\w\u0E00-\u0E7F]+/g) || [];
    return words.find(word => this.commonCategories.has(word));
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
    content: z.string().describe('The content of the note'),
    isPrivate: z.boolean().describe('Whether the note is private'),
    category: z.string().optional().describe('Category of the note (e.g., "todo", "reminder", "idea")'),
  });

  private searchNotesSchema = z.object({
    query: z.string().describe('The search query for finding notes'),
    page: z.number().optional().describe('Page number for pagination'),
    pageSize: z.number().optional().describe('Number of notes per page'),
    category: z.string().optional().describe('Filter by category'),
    dateFrom: z.string().optional().describe('Filter notes from this date (YYYY-MM-DD)'),
    dateTo: z.string().optional().describe('Filter notes until this date (YYYY-MM-DD)'),
    tagsOnly: z.boolean().optional().describe('Search only in tags'),
  });

  private updateNoteSchema = z.object({
    noteId: z.string().describe('ID of the note to update'),
    content: z.string().optional().describe('New content of the note'),
    isPrivate: z.boolean().optional().describe('Update note privacy'),
    category: z.string().optional().describe('Update note category'),
  });

  private deleteNoteSchema = z.object({
    noteId: z.string().describe('ID of the note to delete'),
  });

  saveNote = tool(
    async (input: z.infer<typeof this.saveNoteSchema>) => {
      const { content, isPrivate = false } = input;
      const tags = this.extractTags(content);
      const category = this.extractCategory(content) || input.category;
      const context = await this.getUserContext(this.userId, this.familyId);

      const note: Note = {
        content,
        tags,
        category,
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
      return `Note saved successfully with ID: ${result.insertedId}. Category: ${category || 'none'}. Tags: ${
        tags.length ? tags.join(', ') : 'none'
      }. Visibility: ${visibility}`;
    },
    {
      name: 'saveNote',
      description: 'Save a note with optional category and privacy settings. Use #tag for tagging.',
      schema: this.saveNoteSchema,
    },
  );

  searchNotes = tool(
    async (input: z.infer<typeof this.searchNotesSchema>) => {
      const { 
        query, 
        page = 1, 
        pageSize = 5, 
        category,
        dateFrom,
        dateTo,
        tagsOnly = false 
      } = input;
      const context = await this.getUserContext(this.userId, this.familyId);

      const filter: any[] = [
        { familyId: context.familyId },
        { $or: [{ isPrivate: false }, { userId: context.userId }] },
      ];

      if (category) {
        filter.push({ category });
      }

      if (dateFrom || dateTo) {
        const dateFilter: any = {};
        if (dateFrom) dateFilter.$gte = new Date(dateFrom);
        if (dateTo) dateFilter.$lte = new Date(dateTo);
        filter.push({ createdAt: dateFilter });
      }

      if (query) {
        if (tagsOnly) {
          filter.push({ tags: { $in: [query.toLowerCase()] } });
        } else {
          filter.push({
            $or: [
              { content: { $regex: query, $options: 'i' } },
              { tags: { $in: [query.toLowerCase()] } },
            ],
          });
        }
      }

      const total = await this.collection.countDocuments({ $and: filter });
      const notes = await this.collection
        .find({ $and: filter })
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();

      if (notes.length === 0) {
        return 'No notes found for this query.';
      }

      const formattedNotes = notes
        .map((note, index) => {
          const visibility = note.isPrivate ? '🔒 Private' : '👨‍👩‍👧‍👦 Family';
          const author = note.userId === context.userId ? 'You' : note.userName;
          const tags = note.tags.length ? `[Tags: ${note.tags.join(', ')}]` : '';
          const categoryStr = note.category ? `[Category: ${note.category}]` : '';
          const date = note.createdAt.toLocaleDateString();
          return `${(page - 1) * pageSize + index + 1}. ${note.content}\n   By: ${author} | ${date} | ${categoryStr} ${tags} ${visibility}`;
        })
        .join('\n\n');

      const totalPages = Math.ceil(total / pageSize);
      return `Found ${total} notes (Page ${page}/${totalPages}):\n${formattedNotes}`;
    },
    {
      name: 'searchNotes',
      description: 'Search notes with filters for category, date range, and tags. Supports pagination.',
      schema: this.searchNotesSchema,
    },
  );

  updateNote = tool(
    async (input: z.infer<typeof this.updateNoteSchema>) => {
      const { noteId, content, isPrivate, category } = input;
      const context = await this.getUserContext(this.userId, this.familyId);

      const note = await this.collection.findOne({
        _id: new ObjectId(noteId) as any,
        familyId: context.familyId,
        userId: context.userId,
      });

      if (!note) {
        return 'Note not found or you don\'t have permission to update it.';
      }

      const updateData: Partial<Note> = {
        updatedAt: new Date(),
      };

      if (content) {
        updateData.content = content;
        updateData.tags = this.extractTags(content);
      }
      if (typeof isPrivate === 'boolean') updateData.isPrivate = isPrivate;
      if (category) updateData.category = category;

      await this.collection.updateOne(
        { _id: new ObjectId(noteId) as any },
        { $set: updateData },
      );

      return 'Note updated successfully.';
    },
    {
      name: 'updateNote',
      description: 'Update an existing note\'s content, privacy, or category',
      schema: this.updateNoteSchema,
    },
  );

  deleteNote = tool(
    async (input: z.infer<typeof this.deleteNoteSchema>) => {
      const { noteId } = input;
      const context = await this.getUserContext(this.userId, this.familyId);

      const result = await this.collection.deleteOne({
        _id: new ObjectId(noteId) as any,
        familyId: context.familyId,
        userId: context.userId,
      });

      if (result.deletedCount === 0) {
        return 'Note not found or you don\'t have permission to delete it.';
      }

      return 'Note deleted successfully.';
    },
    {
      name: 'deleteNote',
      description: 'Delete a note by its ID',
      schema: this.deleteNoteSchema,
    },
  );

  getAllTags = tool(
    async () => {
      const context = await this.getUserContext(this.userId, this.familyId);

      const pipeline = [
        {
          $match: {
            familyId: context.familyId,
            $or: [{ isPrivate: false }, { userId: context.userId }],
          },
        },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ];

      const tagStats = await this.collection.aggregate(pipeline).toArray();

      if (tagStats.length === 0) {
        return 'No tags found in notes.';
      }

      const formattedTags = tagStats
        .map(tag => `${tag._id} (${tag.count} notes)`)
        .join('\n');

      return `Available tags:\n${formattedTags}`;
    },
    {
      name: 'getAllTags',
      description: 'Get all unique tags used in notes with their usage count',
      schema: z.object({}),
    },
  );

  getAllCategories = tool(
    async () => {
      const context = await this.getUserContext(this.userId, this.familyId);

      const pipeline = [
        {
          $match: {
            familyId: context.familyId,
            $or: [{ isPrivate: false }, { userId: context.userId }],
            category: { $exists: true, $ne: null },
          },
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ];

      const categoryStats = await this.collection.aggregate(pipeline).toArray();

      if (categoryStats.length === 0) {
        return 'No categories found in notes.';
      }

      const formattedCategories = categoryStats
        .map(cat => `${cat._id} (${cat.count} notes)`)
        .join('\n');

      return `Available categories:\n${formattedCategories}`;
    },
    {
      name: 'getAllCategories',
      description: 'Get all unique categories used in notes with their usage count',
      schema: z.object({}),
    },
  );

  private getAllNotesSchema = z.object({
    page: z.number().optional().describe('Page number (starts from 1)'),
    pageSize: z.number().optional().describe('Number of notes per page'),
    sortBy: z.enum(['createdAt', 'updatedAt']).optional().describe('Sort notes by field'),
    sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort order'),
  });

  getAllNotes = tool(
    async (input: z.infer<typeof this.getAllNotesSchema>) => {
      const { 
        page = 1, 
        pageSize = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = input;
      
      const context = await this.getUserContext(this.userId, this.familyId);

      const filter = {
        $and: [
          { familyId: context.familyId },
          { $or: [{ isPrivate: false }, { userId: context.userId }] },
        ],
      };

      const total = await this.collection.countDocuments(filter);
      const notes = await this.collection
        .find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();

      if (notes.length === 0) {
        return 'No notes found.';
      }

      const formattedNotes = notes
        .map((note, index) => {
          const visibility = note.isPrivate ? '🔒 Private' : '👨‍👩‍👧‍👦 Family';
          const author = note.userId === context.userId ? 'You' : note.userName;
          const tags = note.tags.length ? `[Tags: ${note.tags.join(', ')}]` : '';
          const categoryStr = note.category ? `[Category: ${note.category}]` : '';
          const date = note.createdAt.toLocaleDateString();
          return `${(page - 1) * pageSize + index + 1}. ${note.content}\n   By: ${author} | ${date} | ${categoryStr} ${tags} ${visibility}`;
        })
        .join('\n\n');

      const totalPages = Math.ceil(total / pageSize);
      return `All notes (Page ${page}/${totalPages}, Total: ${total}):\n${formattedNotes}`;
    },
    {
      name: 'getAllNotes',
      description: 'Get all accessible notes with pagination and sorting options',
      schema: this.getAllNotesSchema,
    },
  );
}
