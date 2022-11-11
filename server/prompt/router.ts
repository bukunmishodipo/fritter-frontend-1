import type {NextFunction, Request, Response} from 'express';
import express from 'express';
import PromptResponseCollection from './collection';
import * as userValidator from '../user/middleware';
import * as likeValidator from '../like/middleware';
import * as promptResponseValidator from './middleware';
import * as util from './util';

const router = express.Router();

/**
 * Get all the prompt responses
 *
 * @name GET /api/prompts
 *
 * @return {FreetResponse[]} - A list of all the prompt responses sorted in descending
 *                      order by date modified
 */
/**
 * Get prompt responses by author.
 *
 * @name GET /api/responses?userId=id
 *
 * @return {FreetResponse[]} - An array of freets created by user with id, authorId
 * @throws {400} - If authorId is not given
 * @throws {404} - If no user has given authorId
 *
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    // Check if authorId query parameter was supplied
    if (req.query.user !== undefined) {
      next();
      return;
    }
    const allPrompts = await PromptResponseCollection.findAll();
    console.log(allPrompts);
    const response = allPrompts.map(util.constructPromptResponseResponse);
    res.status(200).json(response);
  },
  [
    likeValidator.isUserExists
  ],
  async (req: Request, res: Response) => {
    const userPrompts = await PromptResponseCollection.findAllByUsername(req.query.user as string);
    const response = userPrompts.map(util.constructPromptResponseResponse);
    res.status(200).json(response);
  }
);

/**
 * Create a new freet.
 *
 * @name POST /api/freets
 *
 * @param {string} content - The content of the freet
 * @return {FreetResponse} - The created freet
 * @throws {403} - If the user is not logged in
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.post(
  '/',
  [
    userValidator.isUserLoggedIn,
    promptResponseValidator.isValidResponseContent,
    promptResponseValidator.isAnsweredAlready
  ],
  async (req: Request, res: Response) => {
    const userId = (req.session.userId as string) ?? ''; // Will not be an empty string since its validated in isUserLoggedIn
    const promptResponse = await PromptResponseCollection.addOne(userId, req.body.content);

    res.status(201).json({
      message: 'Your response was created successfully.',
      prompt: util.constructPromptResponseResponse(promptResponse)
    });
  }
);

/**
 * Delete a prompt response
 *
 * @name DELETE /api/prompts
 *
 * @return {string} - A success message
 * @throws {403} - If the user is not logged in or is not the author of
 *                 the freet
 * @throws {404} - If the freetId is not valid
 */
router.delete(
  '/:responseId?',
  [
    userValidator.isUserLoggedIn,
    promptResponseValidator.isResponseExists,
    promptResponseValidator.isValidResponseModifier
  ],
  async (req: Request, res: Response) => {
    await PromptResponseCollection.deleteOne(req.params.responseId);
    res.status(200).json({
      message: 'Your response was deleted successfully.'
    });
  }
);

/**
 * Modify a response
 *
 * @name PUT /api/freets/:id
 *
 * @param {string} content - the new content for the freet
 * @return {FreetResponse} - the updated freet
 * @throws {403} - if the user is not logged in or not the author of
 *                 of the freet
 * @throws {404} - If the freetId is not valid
 * @throws {400} - If the freet content is empty or a stream of empty spaces
 * @throws {413} - If the freet content is more than 140 characters long
 */
router.put(
  '/:responseId?',
  [
    userValidator.isUserLoggedIn,
    promptResponseValidator.isResponseExists,
    promptResponseValidator.isValidResponseModifier,
    promptResponseValidator.isValidResponseContent
  ],
  async (req: Request, res: Response) => {
    const promptResponse = await PromptResponseCollection.updateOne(req.params.responseId, req.body.content);
    res.status(200).json({
      message: 'Your response was updated successfully.',
      promptResponse: util.constructPromptResponseResponse(promptResponse)
    });
  }
);

export {router as promptResponseRouter};
