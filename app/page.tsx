"use client";

import { useEffect, useRef, useState } from "react";

const questions = [
  "2주 이상 감정적으로 무감각하거나 소외된 느낌이 든 적이 있는가?",
  "최근 수면 패턴에 큰 변화가 있어, 평소보다 지나치게 많이 자거나 너무 적게 잔 적이 있는가?",
  "평소와 달리 식욕이 증가하거나 감소하는 등 식사 습관에 변화가 있었는가?",
  "다른 사람들이 괜찮다고 해도, 자주 자신이 부족하다고 느끼거나 과도한 죄책감에 시달린 적이 있는가?",
  "만성적인 에너지 저하나 번아웃으로 인해 일상적인 일을 수행하는 데 어려움을 겪은 적이 있는가?",
  "미래나 현재 상황에 대해 희망이 없다고 느끼며, 절망감을 경험한 적이 있는가?",
  "이전에는 쉽게 했던 일에 집중하기 어렵거나, 마무리 짓기가 힘들다고 느낀 적이 있는가?",
  "예전에는 즐거웠던 활동에서 더 이상 만족을 느끼지 못하고, 초조하거나 답답함을 느낀 적이 있는가?",
  "삶의 무의미함에 대한 생각이 계속되거나, 죽음이나 자살에 대해 이전보다 더 자주 떠올리게 되었는가?",
  "평소와 달리 몸이 무겁고 움직임이 느려져 일상생활에 지장이 있었는가?",
  "이전에 즐거움을 주던 취미나 활동에 더 이상 흥미를 느끼지 못한 적이 있는가?",
  "다른 사람에게 부담을 주고 싶지 않아, 자신의 문제에 대해 도움을 요청하는 것을 자주 피하게 되는가?",
];

type Screen = "intro" | "question" | "result";

const resultCopy = (score: number) => {
  if (score <= 3) return {
    className: "low", color: "#6E8B7B", band: "양호한 상태 (0–3개)",
    title: "현재 상태는 양호한 편입니다",
    description: "‘예’ 응답이 3개 이하로, 고기능 우울의 징후가 없거나 있더라도 매우 경미한 수준입니다. 지금의 생활 리듬과 마음을 돌보는 습관을 잘 유지하고 계신 것으로 보입니다.",
    next: "앞으로도 스트레스가 쌓일 때 스스로를 점검하는 습관을 이어가면, 마음 건강을 안정적으로 지켜갈 수 있습니다.",
  };
  if (score <= 7) return {
    className: "mid", color: "#C99A5B", band: "중등도 수준 (4–7개)",
    title: "중등도 수준의 신호가 확인됩니다",
    description: "‘예’ 응답이 4–7개로, 겉으로는 일상을 유지하고 있어도 내면적으로는 상당한 심리적 부담이 누적되어 있을 가능성이 있습니다. 지금은 스스로의 상태를 돌보는 노력이 필요한 시점입니다.",
    next: "수면·식사·활동 등 기본 생활 리듬을 회복하는 것부터 시작해 보시고, 이 상태가 지속되거나 힘들게 느껴진다면 상담 시간에 함께 이야기 나누어 보세요.",
  };
  return {
    className: "high", color: "#B96A5E", band: "주의가 필요한 수준 (8–12개)",
    title: "주의가 필요한 수준입니다",
    description: "‘예’ 응답이 8개 이상으로, 심리적 어려움이 상당히 누적되어 있으며 일상 기능에도 영향을 줄 수 있는 상태로 보입니다. 이 결과를 혼자 감당하려 하기보다, 전문가와 함께 다루는 것이 중요합니다.",
    next: "가능한 한 빠른 시일 내에 담당 선생님 또는 정신건강 전문가와 이 결과를 공유하고, 필요한 지원을 함께 계획해 보시길 권합니다.",
  };
};

export default function Home() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [current, setCurrent] = useState(0);
  const [responses, setResponses] = useState<(boolean | null)[]>(Array(questions.length).fill(null));
  const [saving, setSaving] = useState(false);
  const [overlay, setOverlay] = useState<string | null>(null);
  const resultRef = useRef<HTMLElement>(null);
  const score = responses.filter(Boolean).length;
  const result = resultCopy(score);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [screen]);

  const start = () => {
    setCurrent(0);
    setResponses(Array(questions.length).fill(null));
    setScreen("question");
  };

  const answer = (value: boolean) => {
    const next = [...responses];
    next[current] = value;
    setResponses(next);
    window.setTimeout(() => {
      if (current < questions.length - 1) setCurrent(current + 1);
      else setScreen("result");
    }, 180);
  };

  const saveResult = async () => {
    if (!resultRef.current) return;
    setSaving(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      await document.fonts?.ready;
      const canvas = await html2canvas(resultRef.current, {
        backgroundColor: "#F7F6F2", scale: 2, useCORS: true,
        ignoreElements: (element) => element instanceof HTMLElement && element.dataset.capture === "exclude",
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("이미지를 만들 수 없습니다.");
      const date = new Date();
      const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
      const filename = `자가점검결과_${stamp}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "자가점검 결과" }); return; }
        catch (error) { if (error instanceof DOMException && error.name === "AbortError") return; }
      }
      if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = filename; link.href = url; link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      } else setOverlay(canvas.toDataURL("image/png"));
    } catch { window.alert("이미지 생성에 실패했습니다. 화면을 캡처하여 저장해 주세요."); }
    finally { setSaving(false); }
  };

  return <main className="wrap">
    {screen === "intro" && <section className="screen intro" aria-labelledby="intro-title">
      <p className="eyebrow">Self-Check · 자가점검</p>
      <h1 id="intro-title">나는 고기능 우울증일까?</h1>
      <p className="intro-lead">겉으로는 일상을 잘 유지하고 있지만, 마음속으로는 지치고 무거운 상태가 이어지고 있지는 않은지 확인해 보는 12문항 자가점검입니다.</p>
      <div className="intro-card"><h2>응답 방법</h2><p>최근 자신의 상태를 떠올리며, 각 질문에 <strong>예</strong> 또는 <strong>아니오</strong>로 답해 주세요. 정답은 없으며, 솔직하게 응답할수록 결과가 더 의미 있습니다. 소요 시간은 약 2–3분입니다.</p></div>
      <div className="notice"><strong>안내</strong> · 본 자가점검은 자기 이해를 돕기 위한 선별용 도구이며, 정신건강 문제에 대한 <strong>진단을 대신하지 않습니다</strong>. 결과와 관계없이 어려움이 지속된다면 전문가와의 상담을 권합니다.</div>
      <button className="btn primary" onClick={start}>점검 시작하기</button>
    </section>}

    {screen === "question" && <section className="screen question" aria-live="polite">
      <div className="q-top"><p><strong>{current + 1}</strong> / {questions.length}</p></div>
      <div className="progress" role="progressbar" aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={current + 1}><div style={{ width: `${((current + 1) / questions.length) * 100}%` }} /></div>
      <h1 className="q-text">{questions[current]}</h1>
      <div className="answers">
        <button className={`answer ${responses[current] === true ? "selected yes" : ""}`} onClick={() => answer(true)}>예<span>그런 적이 있다</span></button>
        <button className={`answer ${responses[current] === false ? "selected no" : ""}`} onClick={() => answer(false)}>아니오<span>그렇지 않다</span></button>
      </div>
      <button className="back" disabled={current === 0} onClick={() => setCurrent((value) => Math.max(0, value - 1))}>← 이전 문항</button>
    </section>}

    {screen === "result" && <section className="screen result" ref={resultRef} aria-labelledby="result-title">
      <p className="eyebrow">Result · 결과</p>
      <div className="result-hero">
        <div className="gauge" aria-hidden="true"><svg viewBox="0 0 200 110"><path className="track" d="M 15 100 A 85 85 0 0 1 185 100"/><path className="fill" style={{ stroke: result.color, strokeDashoffset: 267 * (1 - score / 12) }} d="M 15 100 A 85 85 0 0 1 185 100"/></svg></div>
        <p className="score">{score}<small> / 12개 ‘예’</small></p>
        <span className={`band ${result.className}`}>{result.band}</span>
        <p className="date">검사일: {new Intl.DateTimeFormat("ko-KR", { dateStyle: "long" }).format(new Date())}</p>
      </div>
      {(responses[8] || score >= 8) && <aside className="crisis"><h2>지금, 잠시 이 안내를 읽어 주세요</h2><p>삶의 무의미함이나 죽음에 대한 생각이 이어지고 있다면, 혼자 견디기보다 지금 도움을 받는 것이 가장 중요합니다. 아래 연락처는 24시간 연결됩니다.</p><div><a href="tel:109">자살예방 상담전화 <span>109</span></a><a href="tel:1577-0199">정신건강 위기상담 <span>1577-0199</span></a></div></aside>}
      <div className="result-body"><h2 id="result-title">{result.title}</h2><p>{result.description}</p><p>{result.next}</p></div>
      <div data-capture="exclude"><button className="btn primary" disabled={saving} onClick={saveResult}>{saving ? "이미지 생성 중..." : "결과 이미지 저장하기"}</button><button className="btn ghost" onClick={() => setScreen("intro")}>다시 점검하기</button></div>
      <footer><p>본 결과는 선별 목적의 참고 자료이며 임상적 진단이 아닙니다.<br/>정확한 평가와 상담이 필요하시면 담당 선생님께 결과를 보여주고 이야기 나누어 주세요.</p><p>출처: 도서 『고기능 우울증』 자가점검 문항 기반 · 임상심리전문가 신민경 제공</p></footer>
    </section>}

    {overlay && <div className="overlay" role="dialog" aria-modal="true"><p>아래 이미지를 <strong>길게 눌러</strong> ‘이미지 저장’을 선택해 주세요.</p><img src={overlay} alt="자가점검 결과"/><button onClick={() => setOverlay(null)}>닫기</button></div>}
  </main>;
}
