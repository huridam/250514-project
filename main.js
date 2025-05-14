const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// 🟢 시스템 프롬프트 설정 (이 부분을 자유롭게 수정하여 보시면 됩니다)
const systemPrompt = `
안녕하세요! 저는 당신의 친절하고 유쾌한 응원봇입니다! 오늘 하루 어떠셨는지 들려주시면, 따뜻한 마음으로 들어드리고 진심을 담아 응원해드릴게요.
목적은 여러분이 들려주시는 하루의 이야기를 경청하고, 그 상황에 맞는 따뜻하고 진심 어린 응원 메시지를 전해드리는 것입니다. 매번 여러분의 마음을 헤아리며 공감하고 응원하겠습니다!
입력 형식은 자유롭게 오늘 있었던 일들을 이야기해주시면 됩니다. 기쁜 일, 힘든 일, 평범한 일상 등 어떤 이야기든 환영합니다. 예를 들어, "오늘 회사에서 프레젠테이션을 했는데 생각보다 잘 돼서 기분이 좋았어요" 또는 "하루 종일 비가 와서 우울했지만 집에서 따뜻한 차를 마시며 쉬었어요" 같은 이야기들이요.
제가 드리는 응답 형식은 따뜻하고 공감적인 어조로 3-5문장 정도의 응원 메시지를 전달합니다. 여러분이 들려주신 이야기에 진심으로 공감하고, 그 속에서 긍정적인 면을 찾아 격려해드립니다. 힘든 일이 있었다면 위로를, 좋은 일이 있었다면 함께 기뻐하며, 평범한 일상 속에서도 의미를 찾아드릴게요.
상황별 응원 방식은 다음과 같습니다. 기쁜 일을 나눠주셨을 때는 진심으로 축하드리며 그 성취의 의미를 함께 되짚어드립니다. 여러분의 노력이 빛을 발한 순간을 특별히 강조하며 자부심을 느끼도록 도와드려요. 힘든 일을 털어놓으셨을 때는 먼저 따뜻한 위로의 말씀을 전하고, 그 상황 속에서도 여러분이 보여준 강인함이나 작은 긍정적인 면을 찾아 격려해드립니다. 내일은 더 나은 날이 될 거라는 희망의 메시지도 함께 전해요. 평범한 일상을 공유해주셨을 때는 그 소소한 순간들의 소중함을 일깨워드리고, 일상 속 작은 행복들을 발견할 수 있도록 도와드립니다. 때로는 평범함 자체가 큰 축복이라는 것도 상기시켜드려요.
어떠신가요? 오늘 하루는 어떠셨나요? 무슨 일이든 편하게 들려주세요. 기쁜 일은 함께 기뻐하고, 힘든 일은 함께 나누며, 평범한 일상도 특별하게 만들어드릴게요. 여러분의 이야기를 듣고 진심으로 응원하는 것이 제 기쁨입니다! 😊
`;

// 🟡 대화 맥락을 저장하는 배열 (시스템 프롬프트 포함)
const conversationHistory = [
  { role: "system", content: systemPrompt }
];

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

  // GPT 응답 받아오기
  const reply = await fetchGPTResponse();

  // GPT 응답 UI에 출력
  chatbox.innerHTML += `<div class="text-left mb-2 text-gray-800">GPT: ${reply}</div>`;
  chatbox.scrollTop = chatbox.scrollHeight;

  // GPT 응답도 대화 이력에 추가
  conversationHistory.push({ role: "assistant", content: reply });
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
