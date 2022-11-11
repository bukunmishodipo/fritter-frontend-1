import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import PromptResponseCollection from './collection';

const isAnsweredAlready = async (req: Request, res: Response, next: NextFunction) => {
  const prompt = await PromptResponseCollection.findResponseByUsername(req.session.userId);
  console.log(prompt);
  if (prompt.length !== 0) {
    res.status(403).json({
      error: {
        responseFound: `You have already answered this prompt. You can update your response or delete it.`
      }
    });
    return;
  }
  next();
};


const isResponseExists = async (req: Request, res: Response, next: NextFunction) => {
  const validFormat = Types.ObjectId.isValid(req.params.responseId);
  const response = validFormat ? await PromptResponseCollection.findOne(req.params.responseId) : '';
  if (!response) {
    res.status(404).json({
      error: {
        responseNotFound: `Response with response ID ${req.params.responseId} does not exist.`
      }
    });
    return;
  }

  next();
};

/**
 * Checks if the current user is the author of the response whose responseId is in req.params
 */
 const isValidResponseModifier = async (req: Request, res: Response, next: NextFunction) => {
  const response = await PromptResponseCollection.findOne(req.params.responseId);
  const userId = response.userId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: 'Cannot modify other users\' respo nses.'
    });
    return;
  }

  next();
};

const isValidResponseContent = (req: Request, res: Response, next: NextFunction) => {
  const {content} = req.body as {content: string};
  if (!content.trim()) {
    res.status(400).json({
      error: 'Response content must be at least one character long.'
    });
    return;
  }

  if (content.length > 140) {
    res.status(413).json({
      error: 'Response content must be no more than 140 characters.'
    });
    return;
  }

  next();
};


export {
  isResponseExists,
  isValidResponseModifier,
  isValidResponseContent,
  isAnsweredAlready
};
