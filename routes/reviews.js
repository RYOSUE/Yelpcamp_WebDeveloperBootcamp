const express = require('express');
const router = express.Router({ mergeParams: true }); // mergeParamsをtrueにすることで、親ルートのパラメータを子ルートで使用可能にする);
const { isLoggedIn, validateReview, isReviewAuthor} = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews')

const { createReview } = require('../controllers/reviews');


router.post('/', isLoggedIn, validateReview, catchAsync(createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;