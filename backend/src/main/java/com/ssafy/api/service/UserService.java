package com.ssafy.api.service;

import com.ssafy.api.request.UserDeleteReq;
import com.ssafy.api.request.UserInfoPatchReq;
import com.ssafy.api.request.UserRegisterPostReq;
import com.ssafy.db.entity.User;

/**
 * 유저 관련 비즈니스 로직 처리를 위한 서비스 인터페이스 정의.
 */
public interface UserService {
    User createUser(UserRegisterPostReq userRegisterInfo);

    User getUserByEmail(String email);

    User getUserByNickname(String nickname);

    boolean deleteUserByEmail(String email, UserDeleteReq userDeleteReq);

    boolean patchUserByEmail(String userEmail, UserInfoPatchReq userPatchReq);
}
