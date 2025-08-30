import { Request, Response } from 'express';
import {
  chapterService,
  createChapterSchema,
  updateChapterSchema,
} from '../../../core';

export const getAllChapters = async (req: Request, res: Response) => {
  try {
    const chapters = await chapterService.getAllChapters();
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chapters', error });
  }
};

export const getChapterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const chapter = await chapterService.getChapterById(id);
    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }
    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chapter', error });
  }
};

export const createChapter = async (req: Request, res: Response) => {
  try {
    const validatedData = createChapterSchema.parse(req.body);
    const newChapter = await chapterService.createChapter(validatedData);
    res.status(201).json(newChapter);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error });
  }
};

export const updateChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateChapterSchema.parse(req.body);
    const updatedChapter = await chapterService.updateChapter(
      id,
      validatedData
    );
    res.status(200).json(updatedChapter);
  } catch (error) {
    // You might want to differentiate between validation errors and not found errors
    res.status(400).json({ message: 'Error updating chapter', error });
  }
};

export const deleteChapter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await chapterService.deleteChapter(id);
    res.status(204).send(); // No content
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chapter', error });
  }
};
