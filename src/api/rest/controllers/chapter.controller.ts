import { Request, Response } from 'express';
import {
  getAllChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  createChapterSchema,
  updateChapterSchema,
} from '../../../core';

export const chapterController = {
  getAllChapters: async (_req: Request, res: Response) => {
    try {
      const chapters = await getAllChapters();
      res.json(chapters);
    } catch {
      res.status(500).json({ error: 'Failed to retrieve chapters' });
    }
  },

  getChapterById: async (req: Request, res: Response) => {
    try {
      const chapter = await getChapterById(req.params.id);
      if (chapter) {
        res.json(chapter);
      } else {
        res.status(404).json({ error: 'Chapter not found' });
      }
    } catch {
      res.status(500).json({ error: 'Failed to retrieve chapter' });
    }
  },

  createChapter: async (req: Request, res: Response) => {
    try {
      const validatedData = createChapterSchema.parse(req.body);
      const newChapter = await createChapter(validatedData);
      res.status(201).json(newChapter);
    } catch (error) {
      res.status(400).json({ error: 'Invalid data', details: error });
    }
  },

  updateChapter: async (req: Request, res: Response) => {
    try {
      const validatedData = updateChapterSchema.parse(req.body);
      const updatedChapter = await updateChapter(req.params.id, validatedData);
      res.json(updatedChapter);
    } catch (error) {
      res.status(400).json({ error: 'Invalid data', details: error });
    }
  },

  deleteChapter: async (req: Request, res: Response) => {
    try {
      await deleteChapter(req.params.id);
      res.status(204).send();
    } catch {
      res.status(500).json({ error: 'Failed to delete chapter' });
    }
  },
};
