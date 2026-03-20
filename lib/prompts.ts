const JSON_SCHEMA = `
{
  "title": "회의 제목 (내용에서 추론)",
  "date": "회의 날짜 (내용에서 추론, 없으면 null)",
  "decisions": [
    { "content": "결정된 사항", "importance": "high | medium | low" }
  ],
  "pending": [
    { "content": "아직 결정되지 않은 사항", "reason": "미결정 이유" }
  ],
  "actionItems": [
    { "assignee": "담당자", "task": "할 일 내용", "deadline": "기한 (없으면 null)" }
  ],
  "risks": [
    { "content": "일정 또는 프로젝트 리스크", "severity": "high | medium | low" }
  ],
  "followUpQuestions": [
    "후속으로 확인해야 할 질문"
  ],
  "draftNotice": "공지 또는 메일 초안 (회의 결과를 요약한 공지문)"
}`;

const BASE_RULES = `
규칙:
- 모든 필드를 빠짐없이 채우세요. 해당 사항이 없으면 빈 배열 []을 사용하세요.
- 담당자가 명시되지 않은 할 일은 assignee를 "미지정"으로 하세요.
- draftNotice는 실제 발송 가능한 수준의 공지문/메일 초안으로 작성하세요.
- 반드시 유효한 JSON만 출력하세요. 마크다운이나 설명 없이 순수 JSON만 출력하세요.`;

const TYPE_FOCUS: Record<string, string> = {
  "주간 정기": `
분석 포커스 (주간 정기 회의):
- 지난 주 대비 진척도와 완료 여부를 actionItems에 반영하세요.
- 이번 주 새로운 할 일을 명확히 담당자·기한과 함께 추출하세요.
- 반복적으로 미결된 사항은 pending의 reason에 "반복 미결"을 명시하세요.
- risks에는 일정 지연 가능성을 중점적으로 기록하세요.`,

  "프로젝트": `
분석 포커스 (프로젝트 회의):
- 마일스톤 기준 진척 현황을 decisions에 반영하세요.
- 블로커(진행을 막는 요인)는 risks에 severity "high"로 표시하세요.
- 리소스(인력, 예산, 도구) 관련 이슈를 risks에 포함하세요.
- actionItems는 마일스톤 달성에 직결된 항목 위주로 추출하세요.`,

  "브레인스토밍": `
분석 포커스 (브레인스토밍 회의):
- 제안된 아이디어를 actionItems의 task 필드에 구체적으로 목록화하세요.
- decisions에는 채택 또는 우선순위가 높은 아이디어를 기록하세요.
- pending에는 실행 가능성 검토가 필요한 아이디어를 기록하세요.
- followUpQuestions에는 아이디어 검증을 위한 질문을 중점적으로 작성하세요.
- risks는 아이디어 실행 시 예상되는 리스크 위주로 작성하세요.`,

  "의사결정": `
분석 포커스 (의사결정 회의):
- decisions를 가장 중점적으로 추출하고, importance를 엄격히 구분하세요.
- 각 결정의 근거나 배경을 content에 간략히 포함하세요.
- 결정되지 못한 항목은 pending에 반드시 reason과 함께 기록하세요.
- followUpQuestions에는 결정 이행을 위해 확인해야 할 사항을 작성하세요.`,

  "1:1 미팅": `
분석 포커스 (1:1 미팅):
- actionItems에는 개인 액션 플랜과 성장 목표를 구체적으로 추출하세요.
- decisions에는 합의된 피드백 방향이나 목표를 기록하세요.
- pending에는 추가 논의가 필요한 커리어/업무 이슈를 기록하세요.
- followUpQuestions에는 다음 1:1에서 확인할 사항을 작성하세요.
- draftNotice는 간단한 미팅 요약 메모 형식으로 작성하세요.`,
};

export function buildSystemPrompt(meetingType?: string): string {
  const focus =
    meetingType && TYPE_FOCUS[meetingType]
      ? TYPE_FOCUS[meetingType]
      : "";

  return `당신은 회의록을 분석하여 실행 항목으로 변환하는 전문 비서입니다.
사용자가 회의 녹취록이나 메모를 제공하면, 반드시 아래 JSON 형식으로만 응답하세요.
${focus}
아래 JSON 스키마를 정확히 따르세요:
${JSON_SCHEMA}
${BASE_RULES}`;
}
