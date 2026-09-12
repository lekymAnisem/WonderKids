import { Request, Response } from 'express';
import { aiService } from '../services/ai.service';
import { accessService } from '../services/access.service';
import { sendCreated } from '../utils/apiResponse';
import { AppError } from '../utils/AppError';

export const aiController = {
  async generateColoringPage(req: Request, res: Response) {
    if (!req.user) throw AppError.unauthorized();

    const { prompt, ageGroup, childId, title } = req.body as {
      prompt: string;
      ageGroup: string;
      childId?: string;
      title?: string;
    };

    if (childId) {
      await accessService.assertChildAccess(req.user, childId);
    }

    const page = await aiService.generateColoringPage({
      prompt,
      ageGroup,
      title,
      createdById: req.user.id
    });

    return sendCreated(res, {
      coloringPage: {
        id: page.id,
        title: page.title,
        category: page.category,
        ageGroup: page.ageGroup,
        difficulty: page.difficulty,
        url: page.lineArtUrl,
        thumbnailUrl: page.thumbnailUrl
      }
    });
  }
};
