import { Document, Schema, model, models } from "mongoose";

export interface ICategory extends Document {
  _id: string;
  title: string;
  image: string;
}

const CategorySchema = new Schema<ICategory>({
  title: { type: String, required: true, unique: true },
  image: { type: String, required: true },
});

const Category =
  models.Category || model<ICategory>("Category", CategorySchema);

export default Category;
