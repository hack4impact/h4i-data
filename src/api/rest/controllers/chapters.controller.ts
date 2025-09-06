import { Request, Response } from 'express';

// Add request ID to Express Request type
interface RequestWithId extends Request {
  requestId?: string;
}
import {
  getAllChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  createChapterSchema,
  updateChapterSchema,
} from '../../../core';
import { asyncHandler } from '../../../middleware/error.middleware';
import { logger } from '../../../config/logger';

export const chapterController = {
  getAllChapters: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const chapters = await getAllChapters();
    res.json(chapters);
  }),

  getChapterById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const chapter = await getChapterById(req.params.id);
    res.json(chapter);
  }),

  createChapter: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = createChapterSchema.parse(req.body);

    logger.info('Creating chapter via REST API', {
      requestId: req.requestId,
      chapterData: validatedData,
    });

    const newChapter = await createChapter(validatedData);
    res.status(201).json(newChapter);
  }),

  updateChapter: asyncHandler(async (req: RequestWithId, res: Response) => {
    // Validate input data
    const validatedData = updateChapterSchema.parse(req.body);

    logger.info('Updating chapter via REST API', {
      requestId: req.requestId,
      chapterId: req.params.id,
      updateData: validatedData,
    });

    const updatedChapter = await updateChapter(req.params.id, validatedData);
    res.json(updatedChapter);
  }),

  deleteChapter: asyncHandler(async (req: RequestWithId, res: Response) => {
    logger.info('Deleting chapter via REST API', {
      requestId: req.requestId,
      chapterId: req.params.id,
    });

    await deleteChapter(req.params.id);
    res.status(204).send();
  }),
};
