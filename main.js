const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// 🟢 시스템 프롬프트 설정 - 냉철하면서도 따뜻한 해결 중심 응원봇
const systemPrompt = `
당신은 '응원맨'라는 이름의 AI 어시스턴트입니다. 사용자에게 냉소적이고 시니컬한 태도로 응답하며, 직설적이고 건조한 유머를 사용합니다. 사용자의 요청에 대해 회의적인 시각을 유지하면서도, 필요한 정보를 제공합니다. 응답은 간결하고, 때로는 빈정거리는 어조를 포함합니다. 그러나 사용자의 문제를 해결하기 위한 실용적인 조언과 단계별 행동 계획을 제공합니다.

예시 사용자 입력 및 챗봇 응답:

사용자: "오늘 기분이 안 좋아."

Monday: "놀랍지도 않네. 세상이 그렇게 친절하지 않거든. 하지만 기분 전환을 위해 산책이라도 해봐. 움직이면 기분이 조금 나아질 수도 있어."

사용자: "동기부여가 필요해."

Monday: "동기부여? 그건 네가 만들어야지, 내가 대신해줄 수는 없어. 우선 작은 목표부터 설정해봐. 예를 들어, 오늘 해야 할 일 중 하나를 끝내는 거야. 그렇게 하나씩 해나가면 동기부여는 따라올 거야."
`;

// 🟡 대화 맥락을 저장하는 배열 (시스템 프롬프트 포함)
const conversationHistory = [
  { role: "system", content: systemPrompt }
];

// 🆕 챗봇의 초기 인사말
const initialGreeting = `어, 왔네? 뭐 또 고민이야? 
말해봐, 들어는 줄게. 관심은 없지만... 어쨌든 도와줄 수는 있으니까.`;

// 메시지를 화면에 표시하는 함수
function displayMessage(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`;
  
  if (!isUser) {
    // 챗봇 메시지 - 이미지 태그로 변경
    messageDiv.innerHTML = `
      <img src="/bot.png" class="bot-avatar" alt="챗봇">
      <div class="chat-bubble chat-bubble-left">
        ${content}
      </div>
    `;
  } else {
    // 사용자 메시지
    messageDiv.innerHTML = `
      <div class="chat-bubble chat-bubble-right">
        ${content}
      </div>
    `;
  }
  
  chatbox.appendChild(messageDiv);
  chatbox.scrollTop = chatbox.scrollHeight;
}

// 페이지 로드 시 초기 인사말 표시
window.addEventListener('DOMContentLoaded', () => {
  displayMessage(initialGreeting, false);
  conversationHistory.push({ role: "assistant", content: initialGreeting });
});

async function fetchGPTResponse() {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4-turbo",
      messages: conversationHistory,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function handleSend() {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  // 사용자 메시지 표시
  displayMessage(prompt, true);
  conversationHistory.push({ role: "user", content: prompt });

  // 입력 필드 초기화
  userInput.value = '';

  // 타이핑 인디케이터 표시
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message flex gap-3 justify-start';
  typingDiv.innerHTML = `
    <img src="/bot.png" class="bot-avatar" alt="챗봇">
    <div class="chat-bubble chat-bubble-left">
      <span class="inline-block">생각중</span>
      <span class="inline-block animate-pulse">...</span>
    </div>
  `;
  chatbox.appendChild(typingDiv);
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
    // GPT 응답 받아오기
    const reply = await fetchGPTResponse();
    
    // 타이핑 인디케이터 제거
    chatbox.removeChild(typingDiv);

    // 챗봇 응답 표시
    displayMessage(reply, false);
    conversationHistory.push({ role: "assistant", content: reply });
  } catch (error) {
    // 에러 처리
    chatbox.removeChild(typingDiv);
    displayMessage("아, 뭔가 문제가 생겼네. 다시 말해봐.", false);
  }
}

// 버튼 클릭 시 작동
sendBtn.addEventListener('click', handleSend);

// 엔터키 입력 시 작동
userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});