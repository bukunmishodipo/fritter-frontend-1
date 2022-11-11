import type {Request, Response, NextFunction} from 'express';
import {Types} from 'mongoose';
import FreetCollection from '../freet/collection';
import CommentCollection from '../comment/collection';
import UserCollection from '../user/collection';
import LikeCollection from '../like/collection';
import LikeModel from './model';

const isUserExists = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.query.user) {
    res.status(400).json({
      error: 'Provided author username must be nonempty.'
    });
    return;
  }

  const user = await UserCollection.findOneByUsername(req.query.user as string);
  if (!user) {
    res.status(404).json({
      error: `A user with username ${req.query.user as string} does not exist.`
    });
    return;
  }

  next();
};

const isValidLikeModifier = async (req: Request, res: Response, next: NextFunction) => {
  const like = await LikeCollection.findOne(req.params.referenceId);
  const userId = like.userId._id;
  if (req.session.userId !== userId.toString()) {
    res.status(403).json({
      error: 'Cannot modify other users\' likes.'
    });
    return;
  }

  next();
};

/**
 * Checks if a like with likeId is req.params exists
 */
 const isLikeExists = async (req: Request, res: Response, next: NextFunction) => {
  const like = await LikeCollection.findOne(req.params.referenceId);
  if (!like) {
    res.status(404).json({
      error: {
        likeNotFound: `Freet with freet ID ${req.params.referenceId} has not been liked, yet.`
      }
    });
    return;
  }

  next();
};

const isLikedAlready = async (req: Request, res: Response, next: NextFunction) => {
  const like = await LikeCollection.findOne(req.body.referenceId);
  console.log('like', like);
  if (like !== null) {
    res.status(403).json({
      error: {
        likeFound: `Freet with freet ID ${req.body.referenceId} has already been liked`
      }
    });
    return;
  }
  next();
};

const isFreetOrCommentExists = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.referenceId ? req.params.referenceId : req.body.referenceId ? req.body.referenceId : req.query.referenceId as string;
  console.log(id);
  const validFormat = Types.ObjectId.isValid(id);
  let reference;
  if (validFormat){
    reference = await FreetCollection.findOne(id);
    if (!reference){
      reference = CommentCollection.findOne(id);
    }
  }
  console.log(reference);
  if (!reference) {
    res.status(404).json({
      error: {
        referenceNotFound: `Reference freet or comment with ID ${id} does not exist.`
      }
    });
    return;
  }

  next();
};


export {
  isFreetOrCommentExists,
  isLikeExists,
  isUserExists,
  isValidLikeModifier,
  isLikedAlready
};
