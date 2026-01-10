import { Router } from 'express';
import { followUser, unfollowUser, getFollowedUsers, checkUserFollow } from '../controllers/followUser.controller.js';
import auth  from '../middlewares/auth.middleware.js';


const router = Router();

router.get('/', (req, res) => {
    res.send('Connection Routes Working');
});

router.post('/follow', auth, followUser);
router.post('/unfollow', auth, unfollowUser);
router.get('/followed-users',  auth, getFollowedUsers);
router.post('/check-follow', auth, checkUserFollow);


export default router;