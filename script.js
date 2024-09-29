const endpoint = "https://api.openai.com/v1/chat/completions";
const dalleEndpoint = "https://api.openai.com/v1/images/generations";
let apiKey = ""; // 전역 변수로 선언
let projectTitle = ""; // 전역 변수로 정의



function setProjectTitle() {
  projectTitle = $('#projectTitleInput').val(); 
  if (!projectTitle) {
    alert("프로젝트 제목을 입력하세요.");
    return false;
  }
  return true;
}

// GPT API 호출 함수
function callGPT(query, callback) {
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{
        role: "user",
        content: query
      }]
    })
  })
  .then(response => response.json())
  .then(data => {
    try {
      console.log(data); // API 응답 데이터 출력

      let content = data.choices[0].message.content;

      // JSON 문자열의 형식을 보장하기 위해 큰따옴표를 사용하도록 변경
      content = content.replace(/(\w+):\s*'/g, '"$1": "').replace(/'/g, '"');

      // 받아온 JSON 데이터를 파싱
      let persona = JSON.parse(content);
      callback(persona);
    } catch (error) {
      console.error("JSON 파싱 오류:", error, data);
    }
  });
}

// DALL-E 3 API 호출 함수
function callDalle(prompt, callback) {
  fetch(dalleEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "dall-e-3",  // DALL-E 3 모델 지정
      prompt: prompt,
      n: 1,  // DALL-E 3은 n=1만 지원합니다.
      size: "1024x1024",  // DALL-E 3의 기본 이미지 크기
      quality: "standard",  // 품질 옵션: "standard" 또는 "hd"
      style: "vivid"  // 스타일 옵션: "vivid" 또는 "natural"
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data && data.data && data.data.length > 0) {
      let imageUrl = data.data[0].url;
      callback(imageUrl);
    } else {
      console.error('이미지 URL을 찾을 수 없습니다.');
    }
  })
  .catch(error => {
    console.error("DALL-E API 오류:", error);
  });
}

// 예시 사용
const imagePrompt = "A beautiful landscape of mountains during sunset with vivid colors.";

callDalle(imagePrompt, function(imageUrl) {
  console.log("Generated Image URL:", imageUrl);
  // 이미지 URL 사용
});

// 번역 API 호출 함수 (GPT를 사용하여 번역)
function translateToEnglish(text, callback) {
  fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Translate the following text to English: "${text}"`
      }]
    })
  })
  .then(response => response.json())
  .then(data => {
    try {
      let translation = data.choices[0].message.content.trim();
      callback(translation);
    } catch (error) {
      console.error("번역 오류:", error, data);
    }
  });
}



$(document).ready(function() {
  // 초기 상태 설정: 직접 생성 버튼을 활성화하고, 인터뷰 생성 버튼을 숨김
  $('#direct-send').show();  // 직접 생성 버튼을 표시
  $('#interview-send').hide();  // 인터뷰 생성 버튼을 숨김
  $('#direct-link').parent().css('color', '#FFF');  // 직접 생성 링크의 텍스트 색상 변경
  $('#direct-link').parent().css('backgroundColor', '#3E8BFF');  // 직접 생성 링크의 배경 색상 변경
  $('#interview-link').parent().css('color', '#787878');  // 인터뷰 생성 링크의 텍스트 색상 변경
  $('#interview-link').parent().css('backgroundColor', '#F1F1F1');  // 인터뷰 생성 링크의 배경 색상 변경
  $('#direct-img').attr('src', 'images/pencil.svg');  // 직접 생성 이미지 변경
  $('#interview-img').attr('src', 'images/bubble_default.svg');  // 인터뷰 생성 이미지 변경

  // 슬라이더 초기 값 설정
  updateValue($('#rangeInput').val());

  // 인터뷰 기반 생성 클릭 이벤트
  $('#interview-link').click(function() {
    // interview-area를 보이도록 하고 custom-area를 숨김
    $('.interview-area').show();
    $('.custom-area').hide();

    // 인터뷰 기반 생성 버튼만 보이도록 설정
    $('#interview-send').show();
    $('#direct-send').hide();

    // 선택된 링크에 스타일을 적용하고 다른 링크의 스타일을 제거
    $('#interview-link').parent().css('color', '#FFF');
    $('#interview-link').parent().css('backgroundColor', '#3E8BFF');
    $('#direct-link').parent().css('color', '#787878');
    $('#direct-link').parent().css('backgroundColor', '#F1F1F1');
          
    // 이미지 src 변경
    $('#direct-img').attr('src', 'images/pencil_default.svg');
    $('#interview-img').attr('src', 'images/bubble.svg');
  });

  // 직접 생성 클릭 이벤트
  $('#direct-link').click(function() {
    // custom-area를 보이도록 하고 interview-area를 숨김
    $('.custom-area').show();
    $('.interview-area').hide();

    // 직접 생성 버튼만 보이도록 설정
    $('#direct-send').show();
    $('#interview-send').hide();

    // 선택된 링크에 스타일을 적용하고 다른 링크의 스타일을 제거
    $('#direct-link').parent().css('color', '#FFF');
    $('#direct-link').parent().css('backgroundColor', '#3E8BFF');
    $('#interview-link').parent().css('color', '#787878');
    $('#interview-link').parent().css('backgroundColor', '#F1F1F1');
    
    // 이미지 src 변경
    $('#direct-img').attr('src', 'images/pencil.svg');  // 직접 생성 이미지 경로
    $('#interview-img').attr('src', 'images/bubble_default.svg');  // 인터뷰 생성 이미지 경로
  });
});

//직접생성
let selectedGender = "여성";
let selectedPersonality = "주도형";
let selectedProficiency = "입문자";
let selectedImmersion = "가벼운 사용자";
let selectedAge = 50; // Default age value
let personaData = {};

function updateValue(val) {
  var rangeValue = document.getElementById('rangeValue');
  rangeValue.innerText = val;

  var rangeInput = document.getElementById('rangeInput');
  var percent = (val - rangeInput.min) / (rangeInput.max - rangeInput.min) * 100;
  var thumbWidth = 20; // Thumb width
  var rangeWidth = rangeInput.offsetWidth;
  var rangeLeft = rangeInput.getBoundingClientRect().left;

  var position = rangeWidth * percent / 100 - thumbWidth / 2;
  rangeValue.style.left = position + 1 + 'px';

  rangeInput.style.background = `linear-gradient(to right, #3E8BFF ${percent}%, #D6E6FF ${percent}%)`;

  selectedAge = val; // Update the selected age
}

$('.gender-btn').click(function() {
  selectedGender = $(this).data('gender');
  $('.gender-btn').removeClass('selected');
  $(this).toggleClass('selected');
});

$('.personality-btn').click(function() {
  selectedPersonality = $(this).data('personality');
  $('.personality-btn').removeClass('selected');
  $(this).toggleClass('selected');
});

$('.proficiency-btn').click(function() {
  selectedProficiency = $(this).data('proficiency');
  $('.proficiency-btn').removeClass('selected');
  $(this).toggleClass('selected');
});

$('.immersion-btn').click(function() {
  selectedImmersion = $(this).data('immersion');
  $('.immersion-btn').removeClass('selected');
  $(this).toggleClass('selected');
});

let apiTag = document.querySelector("#keyinput");
let button2 = apiTag.querySelector("#keyinput button"); // #keyinput 내의 버튼을 선택

button2.addEventListener('click', function(){
  apiTag.style.display = "none";
});



function setApiValue() {
  // input 태그의 값을 가져오기
  const userInputValue = document.getElementById("apiInput").value;
  
  // 가져온 값을 apiKey 변수에 할당
  apiKey = userInputValue;
  
  // 확인을 위해 콘솔에 출력
  console.log("API Key:", apiKey);
}




$('#direct-send').click(function() {
  if (!setProjectTitle()) {
    return;
  }

  showLoadingSpinner(); // 퍼소나 카드 생성 시작 시 로딩 스피너 표시

  // JavaScript 배열 선언
  const locations = ["서울", "부산", "인천", "대구", "대전", "광주", "울산", "세종", 
    "강원", "경기", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];

  // 랜덤으로 위치 선택
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];

  const query = `${projectTitle}를 주제로 퍼소나를 1개 만들어줄래? 퍼소나의 나이는 ${selectedAge}, 성별은 ${selectedGender}, 퍼소나의 성격은 DISC성격 유형중 ${selectedPersonality}의 특징을 가져. 몰입도는 ${selectedImmersion}, 숙련도는 ${selectedProficiency}. 퍼소나의 정보에는 name age occupation gender place characteristics current_persona_situation frustration goal motivation needs summary scenario가 들어가야하며 장소는 ${randomLocation} 으로 작성해주고 summary는 "~~하고 싶어요" 처럼 퍼소나의 한마디로 생성된 퍼소나가 말하는 것처럼 부탁해 최대 12글자로 작성해줘 characteristics는 퍼소나의 캐릭터적 특징을 최소 10글자로 작성해주고 scenario는 퍼소나가 서비스나 제품을 사용할 때 상황에 대한 묘사해서 작성해주고 current_persona_situation frustration goal motivation needs 는 최소 28자 이상으로 작성해주고 모두 한국어로 설명하고 JSON형태로 제공해줘 json 중괄호 밖에는 어떠한 것도 작성금지`;

  callGPT(query, function(persona) {
    updateCharacterInfoCustom(persona, Object.keys(personaData).length + 1);

    hideLoadingSpinner(); // 퍼소나 카드 생성 완료 후 로딩 스피너 숨김
  });
});




$(document).on('click', '.edit', function() {
  const dalleData = {
    gender: selectedGender,
    age: selectedAge,
    characteristics: data.characteristics // GPT로부터 받은 데이터를 사용
  };

  let id = $(this).data('id');
  const selectedPersona = personaData[id];

  const query = `${selectedPersona.projectTitle}를 주제로 퍼소나를 1개 만들어줄래? 퍼소나의 나이는 ${selectedAge}, 성별은 ${selectedGender}, 퍼소나의 성격은 DISC성격 유형중 ${selectedPersonality}의 특징을 가져. 몰입도는 ${selectedImmersion}, 숙련도는 ${selectedProficiency}. 퍼소나의 정보에는 name age occupation gender place characteristics current_persona_situation frustration goal motivation needs summary scenario가 들어가야하며 장소는 ${randomLocation} 으로 작성해주고 summary는 "~~하고 싶어요" 처럼 퍼소나의 한마디로 생성된 퍼소나가 말하는 것처럼 부탁해 최대 12글자로 작성해줘 characteristics는 퍼소나의 캐릭터적 특징을 최소 10글자로 작성해주고 scenario는 퍼소나가 서비스나 제품을 사용할 때 상황에 대한 묘사해서 작성해주고 current_persona_situation frustration goal motivation needs 는 최소 28자 이상으로 작성해주고 모두 한국어로 설명하고 JSON형태로 제공해줘`;

});


$('#reset').click(function() {
  // 선택된 옵션들을 초기화
  selectedGender = "여성";
  selectedPersonality = "주도형";
  selectedProficiency = "입문자";
  selectedImmersion = "가벼운 사용자";
  selectedAge = 50; // 기본값으로 설정

  // UI 초기화
  $('.gender-btn').removeClass('selected');
  $('.personality-btn').removeClass('selected');
  $('.proficiency-btn').removeClass('selected');
  $('.immersion-btn').removeClass('selected');
  
  $('.gender-btn[data-gender="여성"]').addClass('selected');
  $('.personality-btn[data-personality="D 주도형"]').addClass('selected');
  $('.proficiency-btn[data-proficiency="입문자"]').addClass('selected');
  $('.immersion-btn[data-immersion="가벼운 사용자"]').addClass('selected');

  $('#rangeInput').val(selectedAge);
  updateValue(selectedAge); // 슬라이더 값 및 위치 초기화

  // 생성된 퍼소나 카드 모두 삭제
  $('#personas-container').empty();

  // 파일 업로드 입력 초기화
  $('#file-upload').val('');

  // 체크박스 비활성화
  $('#checkInput').prop('checked', false);
  
  // 기타 필요한 초기화 작업을 추가합니다.
});

function generateUniqueId() {
  return 'persona-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

//직접생성
function updateCharacterInfoCustom(data, id) {
  // 필요한 변수들을 영어로 번역
  translateToEnglish(data.characteristics, function(characteristics) {
    translateToEnglish(data.occupation, function(occupation) {
      translateToEnglish(data.place, function(place) {
        translateToEnglish(data.current_persona_situation, function(current_persona_situation) {
         
          const uniqueId = generateUniqueId(); // 고유 ID 생성
          
          // 번역된 텍스트로 DALL-E 요청 프롬프트 생성
          const prompt = `Create a korea person for real. The person is a ${data.gender} aged ${data.age}. 
    Make sure to depict the gender accurately, with appropriate facial expressions, clothing, and background that reflect the following situation: 
    "${data.current_persona_situation}". Ensure the portrait captures the essence of this situation in the person's appearance and environment.`;
          
          // DALL-E 호출
          callDalle(prompt, function(imageUrl) {
            const personaHTML = `
              <div class="persona" id="${uniqueId}">
                
                  <button id="clip" data-id="${uniqueId}"><span class="material-symbols-outlined">
                    assignment
                  </span></button>

                  <h2 class="sen">"${data.summary}"</h2>
                  <div class="img_wrap">
                  
                       
                      <div class="img-area">
                        <img src="${imageUrl}" alt="Persona Image" />
                      </div>
                   
                    <div class="persona-info"><br>
                                    <h2 class="category">Select</h2>    
                  <div class="tag-area">
                      <p class="tag">${selectedPersonality} </p> 
                      <p class="tag">${selectedProficiency} </p> 
                      <p class="tag">${selectedImmersion} </p>
                  </div>

                      <h2 class="category">Personal Info</h2>
                      
                      <div class="info_wrap">
                      <p><span class="title">이름</span>${data.name}</p>
                      <p><span class="title">성별</span>${data.gender}</p>
                      <p><span class="title">나이</span>${data.age}</p>
                      </div>

                      <div class="info_wrap">
                      <p><span class="title">직업</span>${data.occupation}</p>
                      <p><span class="title">주소</span>${data.place}</p>
                      </div>

                      <h2 class="category">User Story</h2>
                      <div><p class="uss">${data.scenario}</p></div>

                    </div>
                  </div>

                  <h2 class="category">Information</h2>
                  <div class="story_wrap">

                  <div class="sty_wrap">
                  <div>
                      <p class="title">특징(characteristics)</p>
                      <p>${data.characteristics}</p>
                  </div>
                  <div>
                      <p class="title">현재상황(current situation)</p>
                      <p>${data.current_persona_situation}</p>
                  </div>
                  </div>

                  <div class="sty_wrap">
                  <div>
                      <p class="title">불만(pain point)</p>
                      <p>${data.frustration}</p>
                  </div>
                  <div>
                      <p class="title">목표(goal)</p>
                      <p>${data.goal}</p>
                  </div>
                  </div>

                  <div class="sty_wrap">
                  <div>
                      <p class="title">동기(motivation)</p>
                      <p>${data.motivation}</p>
                  </div>
                  <div>
                      <p class="title">필요(need)</p>
                      <p>${data.needs}</p>
                  </div>
                  </div>

                  </div>
              </div>
            `;
            document.getElementById('personas-container').innerHTML += personaHTML;
          });

        });
      });
    });
  });
}

// 인터뷰 기반 코드

let jsonData = null;
let step1 = null, step2 = null, step3 = null, step4 = null; // 단계별 데이터를 저장하는 변수들

// Excel 데이터를 기반으로 쿼리를 생성하는 함수
function generateQueryFromExcelData(data) {

  const personalityType = ["D 주도형", "I 사교형", "S 안정형", "C 신중형"];
  // JavaScript 배열 선언
  const locations = ["서울", "부산", "인천", "대구", "대전", "광주", "울산", "세종", 
    "강원", "경기", "충북", "충남", "전북", "전남", "경북", "경남", "제주"];

  // 랜덤으로 위치 선택
  const randomLocation = locations[Math.floor(Math.random() * locations.length)];

  return `
  "${projectTitle}"가 나의 프로젝트 주제야.
  이건 내 인터뷰 내용이야: "${JSON.stringify(data)}"
  너는 퍼소나를 전문적으로 제작하는 ux리서처야.
  내가 준 인터뷰 내용을 사용해서 프로젝트 주제에 맞는 퍼소나를 제작해줘.
  step2에 들어가는 행동변수 이름은 step1에서 나온 행동변수 이름과 같아야해. 
  예를 들어 ㅇㅇ을 이용함. 이 step1에서 나오면 step2의 행동변수엔 ㅇㅇ을 이용함이 그대로 적혀야해. 여기서 적힌 행동변수가 step3까지 이어져야하고.
  퍼소나의 갯수는 반드시 step4에서 분류된 퍼소나 그룹 갯수와 동일해야해. 
  예를들어 step4에서 그룹이 3개가 나왔다면 퍼소나도 3개여야해.
  이건 퍼소나는 제작 단계인데 여기에 맞춰서 제작해줘:
  1. 입력된 인터뷰 내용을 토대로 정책수요자의 행동변수를 작성한다. 행동변수는 아래와 같다.
  - 활동내역: 그들은 어떤 행동을 하나요?
  - 태도: 그들이 서비스 상황에 어떻게 반응하고 생각하나요?
  - 동기: 그들이 서비스를 이용하는 이유는 무엇인가요?
  2. 인터뷰 참여자와 step1에서의 행동변수 관계를 파악 - 행동 변수 별로 인터뷰 참여자의 위치를 퍼소나 시트에 표기
  3. 같은 그룹에 속한 정책수요자 유형을 찾기 - 각 행동 변수마다 유사한 행동을 보인 수요자들을 분류
  4. 각 퍼소나의 특성 파악 및 목표 설정 - 분류된 퍼소나 그룹에 명칭을 지어주고 각 그룹의 특성, 목표, 문제점을 보여준다. 
  5. 누락된 정보는 없는지 살펴보기 - 작성된 각 퍼소나의 특징과 목표 중에 빠진 정보가 없는지 검토하고 중복될 경우 축약함
  6. 퍼소나의 행동 패턴과 주요 특징을 중심으로 상세 설명을 작성 - step4에서 나온 그룹의 특징을 담은 해당 퍼소나만의 스토리를 만들어 자세하게 상세설명을 한다.
  최종적으로 아래와 같은 형식의 하나의 JSON 객체로 전체 퍼소나를 세심하게 생성해줘
  step2에 들어가는 행동변수는 step1에서 나온 것들을 기반으로 한눈에 볼 수 있게 정보를 제공해야해,
  퍼소나의 갯수는 step4에서 나온 퍼소나의 그룹의 갯수와 동일해야해
  아래의 형식으로만 제공. 백틱 및 json등의 영어단어 금지:
  {
      "step1": {
          "activities": ["활동 1", "활동 2", "활동 3"],
          "attitudes": ["태도 1", "태도 2", "태도 3"],
          "motivations": ["동기 1", "동기 2", "동기 3"]
      },
      "step2": {
          "participant_behavior_relationships": {
              "참여자 1": ["행동변수 1", "행동변수 2"],
              "참여자 2": ["행동변수 1", "행동변수 3"]
          }
      },
      "step3": {
          "grouped_behavior_types": {
              "행동변수 1": ["수요자 1", "수요자 2"],
              "행동변수 2": ["수요자 3", "수요자 4"]
          }
      },
      "step4": {
          "grouped_behavior_characteristic": {
              "그룹1 명칭": ["특성", "목표","문제점"],
              "그룹2 명칭": ["특성", "목표","문제점"]
          }
      },
      "personas": [
          {
              "name": "",
              "age": 0,
              "occupation": "",
              "gender": "",
              "place": "",
              "characteristics": "",
              "current_persona_situation": "",
              "frustration": "",
              "goal": "",
              "motivation": "",
              "needs": "",
              "personality": "",
              "proficiency": "",
              "immersion": "",
              "summary": "",
              "scenario":""
          }
      ]
  }
    name은 한국 사람 이름으로 3글자로 작성, personality는 ${personalityType}에서 어디에 해당되는지 한가지를 선택해서 D 주도형 같은 형태로 작성, proficiency은 생성한 페르소나의 숙련도를 입문자 초보자 중급자 전문가 총 4가지로 분류할때 생성된 퍼소나는 어디에 해당되는지 3글자로만 작성, 
    immersion은 생성한 페르소나의 몰입도를 가벼운사용자 평균사용자 몰입사용자 총 3가지로 분류할떄 생성된 퍼소나는 어디에 해당되는지 6글자 이내로만 작성, summary는 "~~하고 싶어요" 등의 퍼소나의 한마디로 생성된 퍼소나가 말하는 것처럼 부탁해 최대 12글자로 작성해줘 , characteristics는 퍼소나의 캐릭터적 특징을 최소 10글자로 작성,
    current_persona_situation frustration goal motivation needs 는 34자 이상 작성, scenario는 이 퍼소나가 서비스나 제품을 이용할 때 어떻게 사용할 건지 묘사해서 작성, place는 ${randomLocation} 으로 작성, 퍼소나의 갯수는 step4에서 나눠진 그룹의 갯수만큼 작성
  `;
}


//인터뷰 생성
function updateCharacterInfoInterview(data, id) {
  translateToEnglish(data.characteristics, function(characteristics) {
    translateToEnglish(data.occupation, function(occupation) {
      translateToEnglish(data.place, function(place) {
        translateToEnglish(data.current_persona_situation, function(current_persona_situation) {
         
          const uniqueId = generateUniqueId(); // 고유 ID 생성
          
          const prompt = `Create a korea person for real. The person is a ${data.gender} aged ${data.age}. 
          Make sure to depict the gender accurately, with appropriate facial expressions, clothing, and background that reflect the following situation: 
          "${data.current_persona_situation}". Ensure the portrait captures the essence of this situation in the person's appearance and environment.`;

          callDalle(prompt, function(imageUrl) {
            const personaHTML = `
              <div class="persona" id="${uniqueId}">
                
                  <button id="clip" data-id="${uniqueId}"><span class="material-symbols-outlined">
                    assignment
                  </span></button>

                  <h2 class="sen">"${data.summary}"</h2>
                  <div class="img_wrap">
                  
                       
                      <div class="img-area">
                        <img src="${imageUrl}" alt="Persona Image" />
                      </div>
                   
                    <div class="persona-info"><br>
                                    <h2 class="category">Select</h2>    
                  <div class="tag-area">
                      <p class="tag">${data.personality} </p> 
                      <p class="tag">${data.proficiency} </p> 
                      <p class="tag">${data.immersion} </p>
                  </div>

                      <h2 class="category">Personal Info</h2>
                      
                      <div class="info_wrap">
                      <p><span class="title">이름</span>${data.name}</p>
                      <p><span class="title">성별</span>${data.gender}</p>
                      <p><span class="title">나이</span>${data.age}</p>
                      </div>

                      <div class="info_wrap">
                      <p><span class="title">직업</span>${data.occupation}</p>
                      <p><span class="title">주소</span>${data.place}</p>
                      </div>

                      <h2 class="category">User Story</h2>
                      <div><p class="uss">${data.scenario}</p></div>

                    </div>
                  </div>

                  <h2 class="category">Information</h2>
                  <div class="story_wrap">

                  <div class="sty_wrap">
                  <div>
                      <p class="title">특징(characteristics)</p>
                      <p>${data.characteristics}</p>
                  </div>
                  <div>
                      <p class="title">현재상황(current situation)</p>
                      <p>${data.current_persona_situation}</p>
                  </div>
                  </div>

                  <div class="sty_wrap">
                  <div>
                      <p class="title">불만(pain point)</p>
                      <p>${data.frustration}</p>
                  </div>
                  <div>
                      <p class="title">목표(goal)</p>
                      <p>${data.goal}</p>
                  </div>
                  </div>

                  <div class="sty_wrap">
                  <div>
                      <p class="title">동기(motivation)</p>
                      <p>${data.motivation}</p>
                  </div>
                  <div>
                      <p class="title">필요(need)</p>
                      <p>${data.needs}</p>
                  </div>
                  </div>

                  </div>
              </div>
            `;
            document.getElementById('personas-container').innerHTML += personaHTML;
          });

        });
      });
    });
  });
}

// 인터뷰 기반 퍼소나 생성 및 DOM 업데이트
$('#interview-send').click(function() {
  if (!setProjectTitle()) {
    return;
  }

  showLoadingSpinner(); // 퍼소나 카드 생성 시작 시 로딩 스피너 표시

  const fileupload = document.getElementById('file-upload');
  const file = fileupload.files[0];

  if (!file) {
    alert("파일을 먼저 업로드하세요.");
    hideLoadingSpinner(); // 파일이 없을 경우 로딩 스피너 숨김
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const query = generateQueryFromExcelData(jsonData, projectTitle); // projectTitle을 인자로 전달
    callGPT(query, function(persona) {
      // step1, step2, step3, step4 데이터 저장
      const step1 = persona.step1;
      const step2 = persona.step2;
      const step3 = persona.step3;
      const step4 = persona.step4;

      // DOM에 데이터 표시
      appendTablesToDOM(step2, step3, step1, step4);

      // 각 퍼소나 업데이트
      persona.personas.forEach((personaData, index) => {
        updateCharacterInfoInterview(personaData, index + 1);
      });


      hideLoadingSpinner(); // 파일이 없을 경우 로딩 스피너 숨김

      // 생성 과정 확인하기 버튼 활성화
      document.getElementById('toggle-process-btn').style.display = 'block';
    });
  };

  reader.onerror = function() {
    console.error('파일을 읽는 중 오류가 발생했습니다.');
    alert("파일을 읽는 중 오류가 발생했습니다.");
  };

  reader.readAsArrayBuffer(file);
});

// 팝업 열기/닫기 버튼
const toggleButton = document.getElementById("toggle-process-btn");
const stepPopup = document.getElementById("step-popup");
const closeButton = document.getElementById("close-popup");

// 팝업 버튼 클릭 시 열고 닫기
toggleButton.addEventListener("click", () => {
  if (stepPopup.style.display === "none" || stepPopup.style.display === "") {
    stepPopup.style.display = "block";
  } else {
    stepPopup.style.display = "none";
  }
});

// 팝업 내 닫기 버튼 클릭 시 팝업 닫기
closeButton.addEventListener("click", () => {
  stepPopup.style.display = "none";
});



function createTable(headers, rows) {
  const table = document.createElement('table');

  const headerRow = table.insertRow();
  headers.forEach(header => {
      const cell = headerRow.insertCell();
      cell.innerHTML = header;
  });

  rows.forEach(rowData => {
      const row = table.insertRow();
      rowData.forEach(cellData => {
          const cell = row.insertCell();
          cell.innerHTML = cellData || '';
      });
  });

  return table;
}

function createTableForStep2(step2Data) {
    if (!step2Data) return null;

    const participants = Object.keys(step2Data.participant_behavior_relationships);
    const behaviors = [];

    participants.forEach(participant => {
        step2Data.participant_behavior_relationships[participant].forEach(behavior => {
            if (!behaviors.includes(behavior)) behaviors.push(behavior);
        });
    });

    const headers = ['행동변수', ...participants];
    const rows = behaviors.map(behavior => [
        behavior,
        ...participants.map(participant =>
            step2Data.participant_behavior_relationships[participant].includes(behavior) ? 'O' : ''
        )
    ]);

    return createTable(headers, rows);
}

function createTableForStep3(step3Data) {
    if (!step3Data) return null;

    const headers = ['행동변수', '수요자'];
    const rows = Object.entries(step3Data.grouped_behavior_types).map(([behavior, types]) => [
        behavior, types.join(', ')
    ]);

    return createTable(headers, rows);
}

function appendTablesToDOM(step2Data, step3Data, step1Data, step4Data) {
  const container = document.getElementById('step-popup');

  // Step 1 데이터 및 타이틀 추가 (표 형식)
  const step1Container = document.getElementById('step1-content');
  step1Container.innerHTML = `<h3>조사된 내용을 토대로 인터뷰 참여자의 행동변수를 작성합니다.</h3>`;
  
  const step1Table = document.createElement('table');
  step1Table.innerHTML = `


    <tr>
      <td class="table-tap">활동내역</td>
      <td class="table-text">${step1Data.activities.join('<br>')}</td>
    </tr>
    

    <tr>
      <td class="table-tap">태도</td>
      <td class="table-text">${step1Data.attitudes.join('<br>')}</td>
    </tr>
    

    <tr>
        <td class="table-tap">동기</td>
        <td class="table-text">${step1Data.motivations.join('<br>')}</td>
    </tr>
    

  `;
  step1Container.appendChild(step1Table);

  // Step 2 타이틀 및 데이터 추가
  const step2Container = document.getElementById('step2-content');
  step2Container.innerHTML = `
      <h3>인터뷰 참여자와 행동변수 관계</h3>
      <p>행동 변수 별로 인터뷰 참여자의 위치를 퍼소나 시트에 표기합니다.
      이때 정확한 위치보다는 그들 간의 상대적인 위치를 중요시합니다.</p>
  `;
  const table2 = createTableForStep2(step2Data);
  if (table2) {
      step2Container.appendChild(table2);
  }

  // Step 3 타이틀 및 데이터 추가
  const step3Container = document.getElementById('step3-content');
  step3Container.innerHTML = `
      <h3>같은 그룹에 속한 인터뷰 참여자를 찾습니다.</h3>
      <p>각 행동 변수마다 유사한 행동을 보인 수요자들을 분류합니다.
      6개~8개 정도의 행동 변수에서 항상 같은 그룹에 속한 사용자들은 퍼소나의 중요한 행동패턴이 될 수 있습니다.</p>
  `;
  const table3 = createTableForStep3(step3Data);
  if (table3) {
      step3Container.appendChild(table3);
  }

  // Step 4 데이터 및 타이틀 추가 (표 형식)
  const step4Container = document.getElementById('step4-content');
  step4Container.innerHTML = `<h3>각 퍼소나의 특성 파악 및 목표 설정을 합니다.</h3>`;
  const step4Headers = ['그룹', '특성', '목표', '문제점'];
  const step4Rows = Object.entries(step4Data.grouped_behavior_characteristic).map(([group, details]) => [
      group, details[0], details[1], details[2]
  ]);
  const step4Table = createTable(step4Headers, step4Rows);
  step4Container.appendChild(step4Table);
}




document.body.addEventListener('click', function(event) {
  if (event.target.matches('#process-icon')) {
      document.getElementById('step-popup').style.display = 'block';
      console.log("클릭");
  } else if (event.target.matches('#close-popup')) {
      document.getElementById('step-popup').style.display = 'none';
      console.log("클릭");
  }
});

document.body.addEventListener('click', function(event) {
  if (event.target.matches('.tab')) {
      const stepContent = document.querySelectorAll('.step-content');
      stepContent.forEach(content => content.classList.remove('active'));

      const stepId = event.target.getAttribute('data-step');
      const targetContent = document.getElementById(`${stepId}-content`);
      if (targetContent) {
          targetContent.classList.add('active');
          console.log("클릭");
      }

      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
  }
});

document.getElementById('file-upload').addEventListener('change', function() {
  var fileName = this.files[0]?.name || "";
  var label = document.getElementById('file-upload-text');
  var label2 = document.getElementById('file-upload-label');
  var button = document.getElementById('interview-send');

  if (fileName) {
      // 파일명이 있으면 라벨 텍스트를 파일명으로 변경하고, 클래스 추가
      label.textContent = fileName;
      label.classList.add('uploaded'); // 라벨에 'uploaded' 클래스 추가
      button.classList.add('uploaded'); // 버튼에 'uploaded' 클래스 추가
      label2.classList.add('uploaded');

      console.log('File uploaded: ' + fileName); // 파일 업로드 확인
      console.log('Label class added: ' + label.classList); // 라벨 클래스 추가 확인
  } else {
      // 파일명이 없으면 라벨과 버튼의 클래스를 기본 상태로 복귀
      label.textContent = "파일을 업로드 해주세요.";
      label.classList.remove('uploaded'); 
      button.classList.remove('uploaded');
      label2.classList.remove('uploaded');

      console.log('No file uploaded, reverting to default.'); // 상태 복구 확인
  }
});

const slider = document.querySelector('#personas-container');
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener('mousedown', e => {
  isDown = true;
  slider.classList.add('active');
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});

slider.addEventListener('mouseleave', () => {
  isDown = false;
  slider.classList.remove('active');
});

slider.addEventListener('mouseup', () => {
  isDown = false;
  slider.classList.remove('active');
});

slider.addEventListener('mousemove', e => {
  if (!isDown) return; 
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = x - startX;
  slider.scrollLeft = scrollLeft - walk;
});



document.querySelectorAll('.tip').forEach(button => {
  button.addEventListener('mouseover', function(event) {
      const tooltip = document.getElementById('tooltip');
      const tipText = this.getAttribute('data-tip-text');

      tooltip.innerHTML = tipText; // textContent 대신 innerHTML로 설정하여 HTML 태그를 인식하게 함

      // 버튼의 위치 계산
      const rect = this.getBoundingClientRect();
      tooltip.style.left = rect.right + 'px';
      tooltip.style.top = rect.top + 'px';

      tooltip.style.display = 'block';
  });

  button.addEventListener('mouseout', function() {
      const tooltip = document.getElementById('tooltip');
      tooltip.style.display = 'none';
  });
});

// 클립보드 복사 시 고유 ID를 기반으로 동작
document.addEventListener('click', function(event) {
  const clipButton = event.target.closest('#clip');
  if (clipButton) {
      const personaId = clipButton.getAttribute('data-id');
      const personaDiv = document.getElementById(personaId);

      if (!personaDiv) {
          console.error('해당 ID를 가진 요소를 찾을 수 없습니다.');
          return;
      }

      const content = personaDiv.cloneNode(true);
      const images = content.getElementsByTagName('img');
      while (images.length > 0) {
          images[0].parentNode.removeChild(images[0]);
      }

      const textToCopy = content.innerText;
      navigator.clipboard.writeText(textToCopy).then(function() {
          alert('퍼소나의 정보가 클립보드에 저장되었어요!');
      }).catch(function(err) {
          console.error('텍스트를 클립보드에 복사할 수 없습니다: ', err);
      });
  }
});

$(document).ready(function() {
  let currentSlide = 0;
  const totalSlides = 4;


  const introSteps = [
      "Step1",
      "Step2",
      "Step3",
      "Step4",
  ];

  const introTitles = [
      "API Key를 입력하여 모든 기능을<br/>사용해보세요.",
      "직접 만들고 싶은 퍼소나의<br/>옵션을 선택해보세요.",
      "진행했던 사용자 조사<br/> 데이터를 바탕으로 제작해보세요.",
      "완성된 퍼소나 카드를<br/>클립보드에 저장해보세요."
  ];

  const introTexts = [
      "자신의 Open API KEY를 발급해서 입력하면<br/>모든 기능을 사용할 수 있습니다.<br/><br/>본 서비스를 이용하기에 앞서 아래 링크를 통해<br/>API KEY를 발급해주세요.<br/><br/>https://platform.openai.com/api-keys",
      "직접생성 기능은 원하는 주제인 제품이나 서비스를 입력하고 원하는 특성을 선택하면, 그 특성이 적용된 퍼소나를 손쉽게 만들 수 있어요.<br/><br/>물음표 아이콘을 통해 모르는 옵션의 툴팁을 확인할 수 있어요.<br/><br/>",
      "인터뷰 기반 생성 기능은 원하는 주제인 제품이나 서비스를 입력하고<br/><br/>기존에 진행했던 사용자 조사 중 인터뷰 내용을 엑셀로 정리하여 업로드 하면 관련된 행동변수를 가진 퍼소나를 생성할 수 있어요.",
      "복사하기 버튼을 눌러 완성된 퍼소나 카드의 데이터를<br/>클립보드에 저장할 수 있어요.<br/><br/>"
  ];

  // Cancel 버튼 클릭 시 인트로 모달 숨김
  $('#cancel').on('click', function() {
      $('#introModal').hide();
  });

  $('#next-btn').on('click', function() {
      if (currentSlide < totalSlides - 1) {
          currentSlide++;
          updateCarousel();
      } else {
          $('#introModal').hide();
          $('#input-apikey').show();
      }
  });

  $('#prev-btn').on('click', function() {
      if (currentSlide > 0) {
          currentSlide--;
          updateCarousel();
      }
  });

  function updateCarousel() {
      // 현재 슬라이드의 제목과 내용을 업데이트
      $('#step2').html(introSteps[currentSlide]);
      $('#h1').html(introTitles[currentSlide]);
      $('#p').html(introTexts[currentSlide]);

      // 이미지 업데이트
      $('#popupImg').attr('src', `./images/popup${currentSlide + 1}.png`);

      // 이전 버튼 활성화 및 비활성화 설정
      if (currentSlide === 0) {
          $('#prev-btn').attr('disabled', true);
      } else {
          $('#prev-btn').attr('disabled', false);
      }

      // 마지막 슬라이드에서 버튼 텍스트를 '시작하기'로 변경하고 색상 변경
  if (currentSlide === totalSlides - 1) {
      $('#next-btn').text('시작하기');
      $('#next-btn').css('background-color', 'var(--main--color)'); // 파란색으로 변경
      $('#next-btn').css('width', '110px');
  } else {
      $('#next-btn').text('다음');
      $('#next-btn').css('background-color', 'var(--gray600--color);'); // 기본 색상으로 복원
      $('#next-btn').css('width', '82px');
  }

      // 슬라이드 인디케이터 업데이트
      $('.indicator').removeClass('active');
      $('.indicator').eq(currentSlide).addClass('active');
  }

  // 페이지 로드 시 초기 슬라이드 업데이트
  updateCarousel();
});

// 로딩 스피너를 보여주는 함수
function showLoadingSpinner() {
  document.querySelector('.loading-container').style.display = 'flex';
}

// 로딩 스피너를 숨기는 함수
function hideLoadingSpinner() {
  setTimeout(function() {
    document.querySelector('.loading-container').style.display = 'none';
  }, 16000); // 3000ms = 3초
}

// F5 및 Ctrl+R 키를 통한 새로고침 막기 + 경고창 표시
document.addEventListener('keydown', function(event) {
  if ((event.ctrlKey && event.key === 'r') || event.key === 'F5') {
      event.preventDefault();
      const confirmation = confirm("현재 페이지에서 나가시겠습니까?");
      if (confirmation) {
          location.reload();
      }
  }
});

// 뒤로 가기 또는 새로고침 시 경고창 표시
window.onbeforeunload = function(event) {
  event.preventDefault();
  event.returnValue = "현재 페이지에서 나가시겠습니까?"; 
  return "현재 페이지에서 나가시겠습니까?";
};

//apikey교체
document.getElementById('changeApikey').onclick = function() {
  document.getElementById('apikeyModal').style.display = 'block';
};

// 모달 닫기
document.querySelector('.close').onclick = function() {
  document.getElementById('apikeyModal').style.display = 'none';
};

// 사용자가 모달 바깥을 클릭했을 때 모달 닫기
window.onclick = function(event) {
  if (event.target == document.getElementById('apikeyModal')) {
      document.getElementById('apikeyModal').style.display = 'none';
  }
};

// API Key 업데이트 함수
function updateApiKey() {
  const newApiKey = document.getElementById('apikey-input').value;
  const inputField = document.querySelector('.input-button-modal');
  if (newApiKey) {
      apiKey = newApiKey;
      alert("API Key가 설정되었습니다!");
      document.getElementById('input-apikey').style.display = 'none';
      document.getElementById('apikeyModal').style.display = 'none';
      inputField.value = "";
  } else {
      alert("유효한 API Key를 입력하세요.");
  }
  console.log("Current API Key:", apiKey);
}

