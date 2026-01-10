import api from "./axios"

// Follow User API
const followUserAPI = async (authorId) => {
    const response = await api.post("/v1/connections/follow", { authorId });
    return response.data;
};

const unfollowUserAPI = async (authorId) => {
    const response = await api.post("/v1/connections/unfollow", { authorId });
    return response.data;
};

const getFollowedUsersAPI = async () => {
    const response = await api.get("/v1/connections/followed-users");
    return response.data;
}

const checkUserFollowAPI = async (authorId) => {
    const response = await api.post("/v1/connections/check-follow", { authorId });
    return response.data;
}

export {
    followUserAPI,
    unfollowUserAPI,
    getFollowedUsersAPI,
    checkUserFollowAPI
};