import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  titleAccent: {
    type: String,
    required: [true, 'Title accent is required'],
    maxlength: [100, 'Title accent cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    required: [true, 'Subtitle is required'],
    maxlength: [200, 'Subtitle cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    validate: {
      validator: (v) => validator.isURL(v),
      message: props => `${props.value} is not a valid URL!`
    }
  },
  ctaText: {
    type: String,
    required: [true, 'CTA text is required'],
    maxlength: [50, 'CTA text cannot exceed 50 characters']
  },
  ctaLink: {
    type: String,
    required: [true, 'CTA link is required'],
    default: '/shop'
  },
  overlay: {
    type: String,
    default: 'rgba(15,5,30,0.65)'
  },
  gradient: {
    type: String,
    default: 'from-[#0c0618]/90 to-[#1e0a3c]/80'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamps on save
heroSlideSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);
export default HeroSlide;