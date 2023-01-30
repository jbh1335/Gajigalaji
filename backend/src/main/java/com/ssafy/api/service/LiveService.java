package com.ssafy.api.service;

import com.ssafy.api.request.LiveRegisterPostReq;
import com.ssafy.db.entity.Live;
import com.ssafy.db.entity.User;

public interface LiveService {
    Live CreateLive(LiveRegisterPostReq liveRegisterInfo, User user, String thumbnailUrl);

    boolean getLiveByUrl(String url);
}
