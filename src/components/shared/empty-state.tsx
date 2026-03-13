interface EmptyStateProps {
  message?: string;
  sub?: string;
}

export function EmptyState({
  message = "아직 등록된 독보적 맛집이 없어요",
  sub = "첫 번째로 독보적인 맛집을 등록해보세요!",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4">🍽️</div>
      <p className="text-lg font-bold text-[#1A1A1A]/60 mb-1">{message}</p>
      <p className="text-sm text-[#1A1A1A]/40">{sub}</p>
    </div>
  );
}
