import type {HydratedDocument, Types} from 'mongoose';
import type {Like} from './model';
import type {User} from '../user/model';
import LikeModel from './model';
import UserCollection from '../user/collection';
import CommentCollection from '../comment/collection';

// Extend Like functionality to comments

/**
 * This files contains a class that has the functionality to explore likes
 * stored in MongoDB, including viewing, liking and unliking liked tweets.
 * Feel free to add additional operations in this file.
 *
 * Note: HydratedDocument<Like> is the output of the FreetModel() constructor,
 * and contains all the information in Like. https://mongoosejs.com/docs/typescript.html
 */
class LikeCollection {
  /**
   * Add a like to the collection
   *
   * @param {string} userId - The user liking the freet
   * @param {Freet} referenceId - The freet
   * @return {Promise<HydratedDocument<Like>>} - The newly created liked freet
   */
  static async addOne(userId: Types.ObjectId | string, referenceId: Types.ObjectId | string): Promise<HydratedDocument<Like>> {
    const date = new Date();

    let isComment;
    const commentObj = await CommentCollection.findOne(referenceId);

    if(commentObj == null){
      isComment = false;
    }
    else{
      isComment = true;
    }

    const like = new LikeModel({
      referenceId,
      isComment,
      userId,
      dateLiked: date,
    });
    await like.save(); // Saves like to MongoDB
    return like.populate('userId');
  }

   /**
   * Find a like by likeId
   *
   * @param {string} likeId - The id of the like to find
   * @return {Promise<HydratedDocument<Like>> | Promise<null> } - The freet with the given referenceId, if any
   */
    static async findOne(referenceId: Types.ObjectId | string): Promise<HydratedDocument<Like>> {
      return LikeModel.findOne({referenceId: referenceId}).populate('userId');
    }
  
    /**
     * Get all the likes in the database
     *
     * @return {Promise<HydratedDocument<Like>[]>} - An array of all of the freets
     */
    static async findAll(): Promise<Array<HydratedDocument<Like>>> {
      // Retrieves freets and sorts them from most to least recent
      return LikeModel.find({}).sort({dateModified: -1}).populate('userId');
    }

  /**
   * Get all likes on a freet
   *
   * @param {Freet} referenceId - The freet
   * @return {Promise<HydratedDocument<Like>[]>} - An array of all of the likes
   */
   static async findAllByFreet(referenceIdToSearchFor: Types.ObjectId | string): Promise<Array<HydratedDocument<Like>>> {
    return LikeModel.find({referenceId: referenceIdToSearchFor}).populate('userId');
  }

  /**
   * Get all of a users likes in the database
   *
   * @param {string} username - The username of author of the freets
   * @return {Promise<HydratedDocument<Freet>[]>} - An array of all of the freets
   */
  static async findLikesByUsername(username: string): Promise<Array<HydratedDocument<Like>>> {
    const user = await UserCollection.findOneByUsername(username);
    return LikeModel.find({userId: user._id}).populate('userId', 'referenceId');
  }

  /**
   * Get number of likes on a freet
   *
   * @param {Freet} referenceId - The freet
   * @return {Promise<Number>} - Number of likes
   */
  //  static async numLikes(referenceId: Types.ObjectId | string): Promise<Number> {
  //   const freet = await FreetCollection.findOne(referenceId);
  //   const num = await LikeCollection.findLikesByFreet(freet._id);
  //   return num.length;
  // }

  static async numLikes(referenceIdToSearchFor: Types.ObjectId| string): Promise<Number> {
    const num = await LikeCollection.findAllByFreet(referenceIdToSearchFor);
    return num.length;
  }

    /**
   * Get users who liked a freet 
   *
   * @param {Freet} referenceId - The freet
   * @return {Promise<HydratedDocument<User>[]>} - An array of all of the likes
   */
     static async findUsersWhoLiked(referenceId: Types.ObjectId | string): Promise<Array<HydratedDocument<User>>> {
      const likes = await LikeCollection.findAllByFreet(referenceId);
      const users = [];
      for (var val of likes) {
        const user = await UserCollection.findOneByUserId(val.userId);
        users.push(user);
      }
      return users;
    }

  /**
   * Remove a freet from a user's likes/ unlike.
   *
   * @param {string} likeId - The referenceId of freet to delete
   * @return {Promise<Boolean>} - true if the freet has been deleted, false otherwise
   */
  static async deleteOne(likeId: Types.ObjectId | string): Promise<boolean> {
    const like = await LikeModel.deleteOne({_id: likeId});
    return like !== null;
  }
}

export default LikeCollection;
