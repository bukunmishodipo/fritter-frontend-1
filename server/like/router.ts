import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import LikeCollection from './collection';
import type {User} from '../user/model';
import * as userValidator from '../user/middleware';
import * as freetValidator from '../freet/middleware';
import * as likeValidator from '../like/middleware';
import * as commentValidator from '../comment/middleware';
import * as util from './util';
import LikeModel from './model';

const router = express.Router();

/**
 * Get all the freets
 *
 * @name GET /api/freets
 *
 * @return {LikeResponse[]} - A list of all the freets sorted in descending
 *                      order by date modified
 */
/**
 * Get comments user.
 *
 * @name GET /api/freets?authorId=id
 *
 * @return {LikeResponse[]} - An array of freets created by user with id, authorId
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.user) next(); // skip to the next middleware in this substack
    else if (req.query.referenceId) next('route'); // skip the rest of this substack, move to next substack
    else{
       // find all likes
      const allLikes = await LikeCollection.findAll();
      const response = await Promise.all(allLikes.map(util.constructLikeResponse));
      // console.log(response);
      res.status(200).json(response);
    }
    },
  [
    likeValidator.isUserExists
  ],
  async (req: Request, res: Response) => {
    // find all likes by username
    const userLikes = await LikeCollection.findLikesByUsername(req.query.user as string);
    const response = await Promise.all(userLikes.map(util.constructLikeResponse));
    res.status(200).json(response);
  }
),

router.get(
  '/',
  [likeValidator.isFreetOrCommentExists],
  async (req: Request, res: Response) => {
    console.log('happy');
    // find all likes by freet/ comment (reference)
    const freetLikes = await LikeCollection.findAllByFreet(req.query.referenceId as string);
    const response = await Promise.all(freetLikes.map(util.constructLikeResponse));
    res.status(200).json(response);
  }
);

/**
 * Create a new like.
 *
 * @name POST /api/likes
 *
 * @return {LikeResponse} - The created like
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    likeValidator.isFreetOrCommentExists,
    likeValidator.isLikedAlready
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const referenceId = (req.body.referenceId as string);
    console.log('user and reference', userId, referenceId);
    const like = await LikeCollection.addOne(userId, referenceId);
    res.status(201).json({
      message: 'Your like was created successfully.',
      like: await util.constructLikeResponse(like)
    });
  }
);

/**
 * Delete a like (Unlike)
 *
 * @name DELETE /api/freets/:referenceId?
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freet
 * @throws {404} - If the freetId is not valid
 */
router.delete(
  '/:referenceId?',
  [
    userValidator.isUserLoggedIn,
    likeValidator.isValidLikeModifier,
    likeValidator.isFreetOrCommentExists,
    likeValidator.isLikeExists,
  ],
  async (req: Request, res: Response) => {
    const like = await LikeCollection.findOne(req.params.referenceId);
    await LikeCollection.deleteOne(like._id);
    res.status(200).json({
      message: 'Your like was deleted successfully.'
    });
  }
);

export {router as likeRouter};
