import { Document, Schema, model, models } from "mongoose";

export interface IBanner extends Document {
  _id: string;
  title: string;
  image: string;
}

const BannerSchema = new Schema({
  title: { type: String, required: true, unique: true },
  image: { type: String, required: true, unique: true },
});

const Banner = models.Banner || model("Banner", BannerSchema);

export default Banner;