import type {HydratedDocument, Types} from 'mongoose';
import type {Comment} from '../comment/model';
import CommentModel from '../comment/model';
import type {PromptResponse} from './model';
import PromptResponseModel from './model';
import UserCollection from '../user/collection';
import type {User} from '../user/model';
import type {Freet} from '../freet/model';
import FreetCollection from '../freet/collection';

/**
 * This files contains a class that has the functionality to explore likes
 * stored in MongoDB, including viewing, liking and unliking liked tweets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Like> is the output of the FreetModel() constructor,
 * and contains all the information in Like. https://mongoosejs.com/docs/typescript.html
 */
class PromptResponseCollection {
  /**
   * Add a prompt response to the collection
   *
   * @param {string} userId - The user who responds to the prompt
   * @param {string} content - content of the response
   * @return {Promise<HydratedDocument<Comment>>} - The newly created response
   */
  static async addOne(userId: Types.ObjectId | string, content: string): Promise<HydratedDocument<PromptResponse>> {
    const date = new Date();
    const comment = new PromptResponseModel({
      userId,
      content,
      dateResponded: date,
      dateModified: date,
    });
    await comment.save(); // Saves responseto MongoDB
    return comment.populate('userId');
  }

    /**
   * Get all the responses in the database
   *
   * @return {Promise<HydratedDocument<PromptResponse>[]>} - An array of all of the responses
   */
     static async findAll(): Promise<Array<HydratedDocument<PromptResponse>>> {
      // Retrieves responses and sorts them from most to least recent
      return PromptResponseModel.find({}).sort({dateModified: -1}).populate('userId');
    }

   /**
   * Find a response by responseId
   *
   * @param {string} responseId - The id of the response to find
   * @return {Promise<HydratedDocument<PromptResponse>> | Promise<null> } - The response with the given responseId, if any
   */
    static async findPrompt(responseId: Types.ObjectId | string): Promise<HydratedDocument<PromptResponse>> {
      return PromptResponseModel.findOne({_id: responseId}).populate('userId');
    }

// find a response by username
    static async findResponseByUsername(userId: Types.ObjectId | string): Promise<Array<HydratedDocument<PromptResponse>>> {
      return PromptResponseModel.find({userId: userId}).populate('userId', 'referenceId');
    }

    static async updateOne(responseId: Types.ObjectId | string, content: string): Promise<HydratedDocument<PromptResponse>> {
      const promptResponse = await PromptResponseModel.findOne({_id: responseId});
      promptResponse.content = content;
      promptResponse.dateModified = new Date();
      await promptResponse.save();
      return promptResponse.populate('userId');
    }

  /**
   * Get all the responses in by given username
   *
   * @param {string} username - The username of author of the responses
   * @return {Promise<HydratedDocument<PromptResponse>[]>} - An array of all of the responses
   */
   static async findAllByUsername(username: string): Promise<Array<HydratedDocument<PromptResponse>>> {
    const user = await UserCollection.findOneByUsername(username);
    return PromptResponseModel.find({userId: user._id}).populate('userId');
  }

    /**
   * Find a response by responseId
   *
   * @param {string} responseId - The id of the response to find
   * @return {Promise<HydratedDocument<PromptResponse>> | Promise<null> } - The response with the given responseId, if any
   */
     static async findOne(responseId: Types.ObjectId | string): Promise<HydratedDocument<PromptResponse>> {
      return PromptResponseModel.findOne({_id: responseId}).populate('userId');
    }



  /**
   * Remove a response
   *
   * @param {string} responseId  - The response to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(responseId: Types.ObjectId | string): Promise<boolean> {
    const response = await PromptResponseModel.deleteOne({_id: responseId});
    return response !== null;
  }
}

export default PromptResponseCollection;
