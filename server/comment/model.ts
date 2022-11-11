import type {Types, PopulatedDoc, Document} from 'mongoose';
import {Schema, model} from 'mongoose';
import type {User} from '../user/model';
import type {Freet} from '../freet/model';
import FreetCollection from '../freet/collection';
import UserCollection from '../user/collection';

/**
 * This file defines the properties stored in a liked Freet
 * DO NOT implement operations here ---> use collection file
 */

// Type definition for Like on the backend
export type Comment = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  userId: Types.ObjectId; // the user who comments on the Freet
  referenceId: Types.ObjectId; // freet being commented on
  isComment: boolean; //checks if the reference freet is a comment
  content: string;
  dateCommented: Date;
};

export type PopulatedComment = {
  _id: Types.ObjectId; // MongoDB assigns each object this ID on creation
  userId: User; // the user who comments on the Freet
  referenceId: Freet | Comment; // what is being commented on
  isComment: boolean;
  content: string;
  dateCommented: Date;
};

// Mongoose schema definition for interfacing with a MongoDB table
// Likes stored in this table will have these fields, with the
// type given by the type property, inside MongoDB

const CommentSchema = new Schema<Comment>({
  // The author userId
  userId: {
    // Use Types.ObjectId outside of the schema
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  referenceId:{
    type: Schema.Types.ObjectId,
    required: true,
  },
  isComment:{
    type: Boolean,
    default: false,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  // The date the comment was created
  dateCommented: {
    type: Date,
    required: true
  },
});

const CommentModel = model<Comment>('comment', CommentSchema);
export default CommentModel;
