import { Response } from 'express';
import {
  getAllChapters,
  getChapterById,
  createChapter,
  updateChapter,
  deleteChapter,
  createChapterSchema,
  updateChapterSchema,
} from '../../../core';
import { asyncHandler, RequestWithId } from '../../../middleware';
import { logger } from '../../../config/logger';

export const chapterController = {
  getAllChapters: asyncHandler(async (_req: RequestWithId, res: Response) => {
    const chapters = await getAllChapters();
    res.json(chapters);
  }),

  getChapterById: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    const chapter = await getChapterById(id);
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
    const id = req.params.id as string;
    // Validate input data
    const validatedData = updateChapterSchema.parse(req.body);

    logger.info('Updating chapter via REST API', {
      requestId: req.requestId,
      chapterId: id,
      updateData: validatedData,
    });

    const updatedChapter = await updateChapter(id, validatedData);
    res.json(updatedChapter);
  }),

  deleteChapter: asyncHandler(async (req: RequestWithId, res: Response) => {
    const id = req.params.id as string;
    logger.info('Deleting chapter via REST API', {
      requestId: req.requestId,
      chapterId: id,
    });

    await deleteChapter(id);
    res.status(204).send();
  }),
};
