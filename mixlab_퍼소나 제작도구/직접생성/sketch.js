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
  rangeValue.style.left = position + 8 + 'px';

  rangeInput.style.background = `linear-gradient(to right, #313131 ${percent}%, #d3d3d3 ${percent}%)`;

  selectedAge = val; // Update the selected age
}

$('.gender-btn').click(function() {
  selectedGender = $(this).data('gender');
  $('.gender-btn').removeClass('selected');
  $(this).toggleClass('selected');
});

$('.personality-btn').click(function() {
  selectedPersonality = $(this).data('personality').split(' ')[0];
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

let apiKey = ""; // 전역 변수로 선언

function setApiValue() {
  // input 태그의 값을 가져오기
  const userInputValue = document.getElementById("apiInput").value;
  
  // 가져온 값을 apiKey 변수에 할당
  apiKey = userInputValue;
  
  // 확인을 위해 콘솔에 출력
  console.log("API Key:", apiKey);

}

const endpoint = "https://api.openai.com/v1/chat/completions";
const dalleEndpoint = "https://api.openai.com/v1/images/generations";

// GPT API 호출 함수
function callGPT(query, callback) {
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
        content: query
      }]
    })
  })
  .then(response => response.json())
  .then(data => {
    try {
      console.log(data); // API 응답 데이터 출력
      let content = data.choices[0].message.content;

      // 받아온 JSON 데이터를 파싱
      let persona = JSON.parse(content);
      callback(persona);
    } catch (error) {
      console.error("JSON 파싱 오류:", error, data);
    }
  });
}

// DALL-E API 호출 함수
function callDalle(data, callback) {
  const prompt = `Create a portrait of a person based on ${data.gender} for gender, ${data.age} for age, ${data.characters} for characteristics. Especially, image the gender accurately. It should depict the entire face and make it lifelike.`;

  fetch(dalleEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      prompt: prompt,
      n: 1,
      size: "256x256"
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

function updateCharacterInfo(data, id) {
  callDalle(data, function(imageUrl) {
    let personaHTML = `
      <div class="persona" id="persona-${id}">
        <div class="tag-area">
          <p class="tag"> ${selectedPersonality}유형 </p> <p class="tag"> ${selectedProficiency} </p> <p class="tag">  ${selectedImmersion} </p>
        </div>
        <div class="img-area"><img src="${imageUrl}" alt="Persona Image" /></div>
        <div class="persona-info">
          <p>${data.name} | ${data.age} | ${data.occupation} | ${data.gender} | ${data.place}</p>
        </div>
        <div>
          <p class="title">특징</p>
          <p>${data.characteristics}</p>
        </div>
        <div>
          <p class="title">현재상황</p>
          <p>${data.current_persona_situation}</p>
        </div>
        <div>
          <p class="title">불만</p>
          <p>${data.frustration}</p>
        </div>
        <div>
          <p class="title">목표</p>
          <p>${data.goal}</p>
        </div>
        <div>
          <p class="title">동기</p>
          <p>${data.motivation}</p>
        </div>
        <div>
          <p class="title">필요</p>
          <p>${data.needs}</p>
        </div>
        <button class="edit" data-id="${id}">다시생성 <img src="replay.png" alt=""></button>
      </div>
    `;
    $('#personas-container').append(personaHTML);
  });

  personaData[id] = {
    gender: selectedGender,
    personality: selectedPersonality,
    proficiency: selectedProficiency,
    immersion: selectedImmersion,
    age: selectedAge // Save the age
  };
}

$('#send').click(function() {
  const query = `비건인들을 위한 주제로 퍼소나를 1개 만들어줄래? 퍼소나의 나이는 ${selectedAge}, 성별은 ${selectedGender}, 퍼소나의 성격은 DISC성격 유형중 ${selectedPersonality}의 특징을 가져. 몰입도는 ${selectedImmersion}, 숙련도는 ${selectedProficiency}. 퍼소나의 정보에는 name age occupation gender place characteristics current_persona_situation frustration goal motivation needs가 들어가야하며 한국어로 설명하고 JSON형태로 제공해줘`;
  callGPT(query, function(persona) {
    updateCharacterInfo(persona, Object.keys(personaData).length + 1);
  });
});

$(document).on('click', '.edit', function() {
  let id = $(this).data('id');
  const selectedPersona = personaData[id];

  const query = `비건인들을 위한 주제로 퍼소나를 1개 만들어줄래? 퍼소나의 나이는 ${selectedPersona.age}, 성별은 ${selectedPersona.gender}, 퍼소나의 성격은 DISC성격 유형중 ${selectedPersona.personality}의 특징을 가져. 몰입도는 ${selectedPersona.immersion}, 숙련도는 ${selectedPersona.proficiency}. 퍼소나의 정보에는 name age occupation gender place characteristics current_persona_situation frustration goal motivation needs가 들어가야하며 한국어로 설명하고 JSON형태로 제공해줘`;

  callGPT(query, function(persona) {
    callDalle(selectedPersona, function(imageUrl) {
      $(`#persona-${id}`).html(`
        <div class="tag-area">
          <p class="tag"> ${selectedPersona.personality}유형 </p> <p class="tag"> ${selectedPersona.proficiency} </p> <p class="tag">  ${selectedPersona.immersion} </p>
        </div>
        <div class="img-area"><img src="${imageUrl}" alt="Persona Image" /></div>
        <div class="persona-info">
          <p>${persona.name} | ${persona.age} | ${persona.occupation} | ${persona.gender} | ${persona.place}</p>
        </div>
        <div>
          <p class="title">특징</p>
          <p>${persona.characteristics}</p>
        </div>
        <div>
          <p class="title">현재상황</p>
          <p>${persona.current_persona_situation}</p>
        </div>
        <div>
          <p class="title">불만</p>
          <p>${persona.frustration}</p>
        </div>
        <div>
          <p class="title">목표</p>
          <p>${persona.goal}</p>
        </div>
        <div>
          <p class="title">동기</p>
          <p>${persona.motivation}</p>
        </div>
        <div>
          <p class="title">필요</p>
          <p>${persona.needs}</p>
        </div>
        <button class="edit" data-id="${id}">다시생성 <img src="replay.png" alt=""></button>
      `);
    });
  });
});

$(document).on('click', '.edit', function() {
  let id = $(this).data('id'); // 클릭한 버튼의 ID를 가져옵니다.

  // 1. 해당 퍼소나 카드 삭제
  $(`#persona-${id}`).remove();

  // 2. 새로운 퍼소나 카드 생성
  const selectedPersona = personaData[id]; // 삭제된 퍼소나의 데이터를 가져옵니다.

  const query = `비건인들을 위한 주제로 퍼소나를 1개 만들어줄래? 퍼소나의 나이는 ${selectedPersona.age}, 성별은 ${selectedPersona.gender}, 퍼소나의 성격은 DISC성격 유형중 ${selectedPersona.personality}의 특징을 가져. 몰입도는 ${selectedPersona.immersion}, 숙련도는 ${selectedPersona.proficiency}. 퍼소나의 정보에는 name age occupation gender place characteristics current_persona_situation frustration goal motivation needs가 들어가야하며 한국어로 설명하고 JSON형태로 제공해줘`;

  callGPT(query, function(persona) {
      // 새로운 카드 생성
      updateCharacterInfo(persona, id); // 이전 카드의 ID를 사용하여 새로운 카드를 생성합니다.
  });
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
  $('.personality-btn[data-personality="주도형"]').addClass('selected');
  $('.proficiency-btn[data-proficiency="입문자"]').addClass('selected');
  $('.immersion-btn[data-immersion="가벼운 사용자"]').addClass('selected');

  $('#rangeInput').val(selectedAge);
  updateValue(selectedAge); // 슬라이더 값 및 위치 초기화

  // 생성된 퍼소나 카드 모두 삭제
  $('#personas-container').empty();

  // 파일 업로드 입력 초기화
  $('#fileInput').val('');

  // 체크박스 비활성화
  $('#checkInput').prop('checked', false);
  
  // 기타 필요한 초기화 작업을 추가합니다.
});