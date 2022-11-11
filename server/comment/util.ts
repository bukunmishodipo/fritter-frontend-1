import type {HydratedDocument} from 'mongoose';
import moment from 'moment';
import type {Comment, PopulatedComment} from '../comment/model';
import FreetModel from '../freet/model';
import CommentModel from '../comment/model';
import type {FreetResponse} from '../freet/util';
import {constructFreetResponse} from '../freet/util';
import type {Freet, PopulatedFreet} from '../freet/model';

// Update this if you add a property to the Freet or Comment type!

type CommentResponse = {
  _id: string;
  user: string;
  reference_freet: FreetResponse | null;
  reference_comment: CommentResponse | null;
  content: string;
  dateCommented: string;
};

/**
 * Encode a date as an unambiguous string
 *
 * @param {Date} date - A date object
 * @returns {string} - formatted date as string
 */
const formatDate = (date: Date): string => moment(date).format('MMMM Do YYYY, h:mm:ss a');

/**
 * Transform a raw comment object from the database into an object
 * with all the information needed by the frontend
 *
 * @param {HydratedDocument<Comment>} comment - A comment
 * @returns {CommentResponse} - The comment object formatted for the frontend
 */
 const constructCommentResponse = async (comment: HydratedDocument<Comment>): Promise<CommentResponse> => {
    const commentCopy: PopulatedComment = {
      ...comment.toObject({
        versionKey: false // Cosmetics; prevents returning of __v property
      })
    };
    const {username} = commentCopy.userId;
    // const {content} = commentCopy.content;

    let reference_comment = null;
    let reference_freet = null;
    if(commentCopy.isComment == true){
      const comment = await CommentModel.findOne({_id: commentCopy.referenceId});
      reference_comment = await constructCommentResponse(comment)
    }
    else{
      console.log(commentCopy.referenceId);
      const freet = await FreetModel.findOne({_id: commentCopy.referenceId});
      console.log('freet:', freet);
      reference_freet = constructFreetResponse(freet); //inside constructFreetResponse we don't use await 
    }
  
    delete commentCopy.userId;
    
    return {
      ...commentCopy, // return all the fields of comment copy
      _id: commentCopy._id.toString(),
      user: username,
      // content: content,
      reference_comment: reference_comment,
      reference_freet: reference_freet,
      dateCommented: formatDate(comment.dateCommented),
    };
  };
  
  export {
    constructCommentResponse,
    CommentResponse
  };
