import { Request, Response } from 'express';
import * as chapterService from '../../services/chapter.service';

/**
 * The controller is responsible for handling the HTTP request and response.
 * It calls the appropriate service function to execute business logic
 * and then sends back a formatted response.
 */

export const getChapterById = async (req: Request, res: Response) => {
  try {
    const chapter = await chapterService.getChapterById(req.params.id);
    if (chapter) {
      res.status(200).json(chapter);
    } else {
      res.status(404).json({ message: 'Chapter not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chapter', error });
  }
};

export const getAllChapters = async (req: Request, res: Response) => {
  try {
    const chapters = await chapterService.getAllChapters();
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chapters', error });
  }
};
