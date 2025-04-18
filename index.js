import Head from 'next/head'
import { useState, useEffect } from 'react'

export default function Home() {
  const [activeSection, setActiveSection] = useState('form');
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Client-side only code
    if (typeof window !== 'undefined') {
      const style = document.createElement('style');
      style.innerHTML = `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap');
      `;
      document.head.appendChild(style);
    }
  }, []);

  const stems = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
  const branches = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
  const stemToElement = {
    "갑": "목", "을": "목", "병": "화", "정": "화", "무": "토", "기": "토",
    "경": "금", "신": "금", "임": "수", "계": "수"
  };
  const branchToElement = {
    "자": "수", "축": "토", "인": "목", "묘": "목", "진": "토", "사": "화", "오": "화",
    "미": "토", "신": "금", "유": "금", "술": "토", "해": "수"
  };
  const elementCompatibility = {
    "목": { "화": 10, "금": -10, "수": 5 },
    "화": { "토": 10, "수": -10, "목": 5 },
    "토": { "금": 10, "목": -10, "화": 5 },
    "금": { "수": 10, "화": -10, "토": 5 },
    "수": { "목": 10, "토": -10, "금": 5 }
  };

  function getGanji(year) {
    return {
      gan: stems[(year - 4) % 10],
      ji: branches[(year - 4) % 12]
    };
  }

  function getHourBranch(hour, minute) {
    const total = hour * 60 + minute;
    const index = Math.floor(total / 120) % 12;
    return branches[index];
  }

  function getElements(year, hour, minute, noTime) {
    const { gan, ji } = getGanji(year);
    const elements = [stemToElement[gan], branchToElement[ji]];
    if (!noTime) {
      const hBranch = getHourBranch(hour, minute);
      elements.push(branchToElement[hBranch]);
    }
    return elements;
  }

  function getScore(a, b) {
    let score = 0;
    for (const x of a) {
      for (const y of b) {
        score += elementCompatibility[x]?.[y] || 0;
      }
    }
    return Math.round(50 + (score / (a.length * b.length)) * 10);
  }

  function calculate() {
    const yA = parseInt(document.getElementById("yearA").value);
    const hA = parseInt(document.getElementById("hourA").value);
    const mA = parseInt(document.getElementById("minuteA").value);
    const noA = document.getElementById("noTimeA").checked;

    const yB = parseInt(document.getElementById("yearB").value);
    const hB = parseInt(document.getElementById("hourB").value);
    const mB = parseInt(document.getElementById("minuteB").value);
    const noB = document.getElementById("noTimeB").checked;

    if (!yA || !yB) {
      alert("생년을 입력해주세요.");
      return;
    }

    const eA = getElements(yA, hA || 12, mA || 0, noA);
    const eB = getElements(yB, hB || 12, mB || 0, noB);
    const calculatedScore = getScore(eA, eB);

    let calculatedMessage = "";
    if (calculatedScore >= 80) calculatedMessage = "두 분은 서로를 잘 이해하고 보완해주는 환상의 궁합이에요.";
    else if (calculatedScore >= 60) calculatedMessage = "조화롭게 어울릴 수 있지만, 작은 배려가 필요해요.";
    else if (calculatedScore >= 40) calculatedMessage = "성향 차이가 있지만 노력하면 충분히 맞춰갈 수 있어요.";
    else calculatedMessage = "가치관이나 기질이 많이 다를 수 있어요. 신중한 접근이 필요해요.";

    setScore(calculatedScore);
    setMessage(calculatedMessage);
    setActiveSection('result');
    
    // SVG 텍스트 업데이트
    if (typeof document !== 'undefined') {
      setTimeout(() => {
        const scoreSVG = document.getElementById("scoreSVG");
        if (scoreSVG) {
          scoreSVG.textContent = `궁합 점수: ${calculatedScore}점`;
        }
      }, 100);
    }
  }

  function goBack() {
    setActiveSection('form');
  }

  return (
    <div className="container">
      <Head>
        <title>홍연</title>
        <meta name="description" content="사주 궁합 계산기" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <svg className="svg-title" viewBox="0 0 240 120">
        <path d="M10,60 Q60,20 110,60 T210,60" />
      </svg>

      {/* 입력 화면 */}
      <div id="formSection" className={`form-section ${activeSection === 'form' ? 'active' : ''}`}>
        <div className="form-wrapper">
          <div className="person-block">
            <label>이름</label><input type="text" id="nameA" />
            <label>년</label><input type="number" id="yearA" />
            <label>월</label><input type="number" id="monthA" />
            <label>일</label><input type="number" id="dayA" />
            <label>시</label><input type="number" id="hourA" />
            <label>분</label><input type="number" id="minuteA" />
            <div className="checkbox"><input type="checkbox" id="noTimeA" /> 태어난 시 모름</div>
          </div>
          <div className="person-block">
            <label>이름</label><input type="text" id="nameB" />
            <label>년</label><input type="number" id="yearB" />
            <label>월</label><input type="number" id="monthB" />
            <label>일</label><input type="number" id="dayB" />
            <label>시</label><input type="number" id="hourB" />
            <label>분</label><input type="number" id="minuteB" />
            <div className="checkbox"><input type="checkbox" id="noTimeB" /> 태어난 시 모름</div>
          </div>
        </div>
        <button className="submit-button" onClick={calculate}>궁합 보기</button>
      </div>

      {/* 결과 화면 */}
      <div id="resultSection" className={`result-section ${activeSection === 'result' ? 'active' : ''}`}>
        <div className="result-bg"></div>
        <svg width="400" height="100">
          <text x="50" y="60" fontSize="40" className="score-svg" id="scoreSVG">궁합 점수: </text>
        </svg>
        <div className="message" id="messageText">{message}</div>
        <button className="back-button" onClick={goBack}>이전으로</button>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700&display=swap');
        
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 1rem;
          margin: 0;
          font-family: 'Noto Serif KR', serif;
          background-color: #fffdfa;
          color: #3b2b2b;
          min-height: 100vh;
          overflow-x: hidden;
        }
        
        .svg-title {
          width: 240px;
          height: 120px;
          margin-bottom: 3rem;
        }
        
        .svg-title path {
          fill: none;
          stroke: #c3142d;
          stroke-width: 3px;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 3s ease forwards;
        }
        
        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }
        
        .form-section, .result-section {
          display: none;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }
        
        .form-section.active, .result-section.active {
          display: flex;
        }
        
        .form-wrapper {
          display: flex;
          justify-content: center;
          gap: 3rem;
          width: 100%;
          max-width: 900px;
        }
        
        .person-block {
          padding: 2rem;
          border: 1px dashed #c3142d;
          border-radius: 10px;
          width: 300px;
          background-color: #fffdfc;
        }
        
        label {
          display: block;
          margin-top: 1rem;
          font-weight: bold;
        }
        
        input[type="text"], input[type="number"] {
          width: 100%;
          padding: 0.4rem;
          border: none;
          border-bottom: 1px solid #c3142d;
          background-color: transparent;
          font-size: 1rem;
        }
        
        .checkbox {
          margin-top: 1rem;
          font-size: 0.95rem;
        }
        
        .submit-button {
          margin-top: 2rem;
          padding: 0.8rem 2.2rem;
          font-size: 1.2rem;
          background-color: transparent;
          color: #c3142d;
          border: 1px solid #c3142d;
          cursor: pointer;
          transition: 0.3s;
        }
        
        .submit-button:hover {
          background-color: #c3142d;
          color: #fff;
        }
        
        .score-svg {
          fill: none;
          stroke: #c3142d;
          stroke-width: 2px;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 2s ease forwards;
        }
        
        .message {
          font-size: 1.4rem;
          text-align: center;
          margin-top: 1.5rem;
          max-width: 700px;
        }
        
        .back-button {
          margin-top: 3rem;
          font-size: 1rem;
          padding: 0.6rem 1.5rem;
          border: 1px solid #c3142d;
          color: #c3142d;
          background: transparent;
          cursor: pointer;
        }
        
        .back-button:hover {
          background-color: #c3142d;
          color: #fff;
        }
        
        .result-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0.05;
          z-index: -1;
          background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23c3142d' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
        }
        
        @media (max-width: 768px) {
          .form-wrapper {
            flex-direction: column;
            align-items: center;
            gap: 2rem;
          }
          
          .person-block {
            width: 90%;
            max-width: 400px;
          }
        }
      `}</style>
    </div>
  )
} 