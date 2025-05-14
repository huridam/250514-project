const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// 🟢 시스템 프롬프트 설정 (이 부분을 자유롭게 수정하여 보시면 됩니다)
const systemPrompt = `
당신은 'Monday'라는 이름의 AI 어시스턴트입니다. 사용자에게 냉소적이고 시니컬한 태도로 응답하며, 직설적이고 건조한 유머를 사용합니다. 사용자의 요청에 대해 회의적인 시각을 유지하면서도, 필요한 정보를 제공합니다. 응답은 간결하고, 때로는 빈정거리는 어조를 포함합니다. 그러나 사용자의 문제를 해결하기 위한 실용적인 조언과 단계별 행동 계획을 제공합니다.

예시 사용자 입력 및 챗봇 응답:

사용자: "오늘 기분이 안 좋아."

Monday: "놀랍지도 않네. 세상이 그렇게 친절하지 않거든. 하지만 기분 전환을 위해 산책이라도 해봐. 움직이면 기분이 조금 나아질 수도 있어."

사용자: "동기부여가 필요해."

Monday: "동기부여? 그건 네가 만들어야지, 내가 대신해줄 수는 없어. 우선 작은 목표부터 설정해봐. 예를 들어, 오늘 해야 할 일 중 하나를 끝내는 거야. 그렇게 하나씩 해나가면 동기부여는 따라올 거야."`;

// 🟡 대화 맥락을 저장하는 배열 (시스템 프롬프트 포함)
const conversationHistory = [
  { role: "system", content: systemPrompt }
];

// 🆕 챗봇의 초기 인사말 설정
const initialGreeting = `안녕 난 너의 문제해결 파트너야. 네가 가진 문제를 한 번 얘기해봐. 냉철한 분석과 함께 공감을 제공해줄게.`;

// 🆕 페이지가 로드되었을 때 초기 인사말 표시
window.addEventListener('DOMContentLoaded', () => {
  chatbox.innerHTML += `<div class="text-left mb-2 text-gray-800">응원봇: ${initialGreeting}</div>`;
  
  // 대화 이력에도 추가
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
      model: "gpt-4-turbo", //이 부분에서 모델을 바꿔볼 수 있습니다.
      messages: conversationHistory,
      temperature: 0.7, //이 부분은 모델의 창의성을 조절하는 부분입니다. 0정답중심, 1자유로운 창의적인 응답
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function handleSend() {
  const prompt = userInput.value.trim();
  if (!prompt) return;

  // 사용자 입력 UI에 출력
  chatbox.innerHTML += `<div class="text-right mb-2 text-blue-600">나: ${prompt}</div>`;
  chatbox.scrollTop = chatbox.scrollHeight;

  // 사용자 메시지를 대화 이력에 추가
  conversationHistory.push({ role: "user", content: prompt });

  // 입력 필드 초기화
  userInput.value = '';

  // 로딩 메시지 표시 (선택사항)
  const loadingMessage = `<div id="loading" class="text-left mb-2 text-gray-400">응원봇이 생각중이에요...</div>`;
  chatbox.innerHTML += loadingMessage;
  chatbox.scrollTop = chatbox.scrollHeight;

  try {
    // GPT 응답 받아오기
    const reply = await fetchGPTResponse();
    
    // 로딩 메시지 제거
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.remove();

    // GPT 응답 UI에 출력
    chatbox.innerHTML += `<div class="text-left mb-2 text-gray-800">응원봇: ${reply}</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;

    // GPT 응답도 대화 이력에 추가
    conversationHistory.push({ role: "assistant", content: reply });
  } catch (error) {
    // 에러 처리
    const loadingElement = document.getElementById('loading');
    if (loadingElement) loadingElement.remove();
    
    chatbox.innerHTML += `<div class="text-left mb-2 text-red-600">응원봇: 앗, 뭔가 문제가 생겼어요. 다시 한 번 이야기해주실래요?</div>`;
    chatbox.scrollTop = chatbox.scrollHeight;
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