import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../Templates/Layout/Header";
import Page from "../../Templates/Layout/Page";
import { getStompClient } from "../../store/socket";

const ChattingMessageItem = ({ senderName, message, sendDate }) => {
  const myName = "나"; // 리덕스에서 현재 사용자 이름 가져오기
  return (
    <div>
      {senderName === myName ? ( // 보낸 메시지
        <div>
          <span>{sendDate}</span>
          <span>{message}</span>
        </div>
      ) : (
        // 받은 메시지
        <div>
          <div>
            <span>{senderName}</span>
            <span>{message}</span>
            <span>{sendDate}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const ChattingMessage = ({ chattingMessages }) => {
  return (
    // 채팅 메시지가 존재하면 채팅 말풍선 생성
    <div>
      {chattingMessages &&
        chattingMessages.map((chattingMessage, i) => (
          <ChattingMessageItem
            key={i}
            // id={chattingMessage.id}
            message={chattingMessage.content}
            senderName={"나"}
            sendDate={chattingMessage.sendDate}
          />
        ))}
    </div>
  );
};

export default function ChatRoom() {
  const roomId = useLocation().state.roomId; // 현재 URL을 통해 RoomId를 얻어옴
  const [chattingMessages, setChattingMessages] = useState([]); // 주고 받은 메시지 리스트
  const [message, setMessage] = useState(""); // 입력창 메시지
  const [userId, setUserId] = useState(1); // 나의 아이디(리덕스로 초기값 가져오기로 수정)
  const [users, setUserList] = useState([]); // 유저 리스트(나, 상대방)
  const [toUser, setToUser] = useState({}); // 상대방 유저
  const stompClient = getStompClient();
  const scrollRef = useRef();
  let navigate = useNavigate();

  // 메시지 배열에 새로운 메시지 추가
  const addMessage = (message) => {
    setChattingMessages((prev) => [...prev, message]);
  };

  // 메시지 받기 : 받은 메시지를 메시지 배열에 추가
  // stomp는 텍스트 처리만 가능하기 때문에 보낼 때 JSON.stringify(newMessage)) 받을 때 JSON.parse(data.body)처리를 꼭 해주어야 함
  const connect = () => {
    stompClient.connect(
      {},
      () => {
        stompClient.subscribe("/sub/room/" + roomId, (data) => {
          const newMessage = JSON.parse(data.body);
          addMessage(newMessage);
        });
      },
      (error) => {
        console.log(error);
      }
    );
  };

  // 처음 컴포넌트가 새롭게 생성되는 시점에 한 번 실행
  // 백엔드 서버에 데이터를 요청할 때 axios 작업할 때 사용
  useEffect(() => {
    if (stompClient === null) {
      return;
    }
    connect();
    // dispatch의 내부에 있는 chattingMessageList라는 함수의 액션 객체를 반환 받아 setChattingMessages, setUserList 하도록 로직 추가 필요
    setChattingMessages([]); // 일단 주고받은 메시지 없다고 선언
    setUserList([
      { id: 1, name: "나" },
      { id: 2, name: "상대방" },
    ]);
  }, []);

  // 의존성 변수 users가 변경될 때만 함수 호출
  // 입장했을 때 setToUser를 설정하기 위해 실행됨
  // sender가 상대방이라면 toUser(receiver)를 나로 설정
  useEffect(() => {
    users.map((user) => user.id != userId && setToUser(user));
  }, [users]);

  // 의존성 변수 chattingMessages가 변경될 때만 함수 호출
  // 새로운 메시지가 생성될때 채팅 스크롤
  // 메시지가 추가될 경우 이벤트가 발생하여, 스크롤을 가장 밑으로 내림
  useEffect(() => {
    scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chattingMessages]);

  // 메시지 보내기
  const sendMessage = () => {
    if (message != "") {
      stompClient.send(
        "/pub/room/message",
        {},
        JSON.stringify({
          content: message,
          senderId: userId,
          receiverId: toUser.id,
          chatRoomId: roomId,
          sendTime: null,
        })
      );
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    setMessage(""); // 메시지 전송 후 문자열 초기화
  };

  // Enter를 누르면 메시지 보냄
  // 전송버튼 클릭시 전송도 추가 구현 필요!
  const onKeyPress = (e) => {
    if (e.key == "Enter") {
      sendMessage();
    }
  };

  return (
    <Page>
      <Header isName="True" headerName="채팅방" />
      {/* scrollRef를 이용하여 아래 div 영역을 스크롤 조작 */}
      <div ref={scrollRef}>
        <div>
          {users.map((user) => user.id != userId && <div>{toUser.name}</div>)}
        </div>
        <div>
          <ChattingMessage chattingMessages={chattingMessages} />
        </div>
        <div>
          <div>
            <input
              id="sendMessage"
              type="text"
              value={message}
              placeholder="메시지를 입력하세요"
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={onKeyPress}
            />
          </div>
          <button onClick={sendMessage}>전송</button>
        </div>
      </div>
    </Page>
  );
}
