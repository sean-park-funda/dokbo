"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const SEED_POSTS = [
  {
    restaurant_name: "을지OB베어",
    menu_item: "노가리 + 맥주",
    location: "을지로3가역",
    category: "술집",
    claim:
      "40년 넘게 같은 자리. 노가리 골목의 원조. 비릿한 노가리에 시원한 생맥주 조합은 을지로 특유의 허름한 분위기와 만나야 완성된다. 깔끔한 체인점에서는 절대 나올 수 없는 맛.",
  },
  {
    restaurant_name: "마포 양미옥",
    menu_item: "양곰탕",
    location: "마포구 도화동",
    category: "한식",
    claim:
      "50년 전통의 양곰탕. 뽀얀 국물에 양과 수육이 듬뿍. 새벽부터 끓인 사골 육수의 깊은 맛은 어떤 곰탕집도 따라올 수 없다. 소금만 살짝 넣으면 그게 바로 완벽.",
  },
  {
    restaurant_name: "신당동 떡볶이 골목 마복림할머니",
    menu_item: "떡볶이",
    location: "신당역",
    category: "분식",
    claim:
      "원조 즉석떡볶이의 시작점. 간장 베이스의 궁중떡볶이 스타일인데, 라면사리와 만두를 같이 끓이면 그 맛은 프랜차이즈 떡볶이와 차원이 다르다.",
  },
  {
    restaurant_name: "평양면옥",
    menu_item: "물냉면",
    location: "중구 장충동",
    category: "한식",
    claim:
      "메밀 향 가득한 면발과 깊으면서도 담백한 육수. 살얼음이 살짝 낀 육수를 한 모금 마시면 여름이고 겨울이고 감탄이 나온다. 이게 진짜 냉면이다.",
  },
  {
    restaurant_name: "봉피양",
    menu_item: "갈비찜",
    location: "강남구 역삼동",
    category: "한식",
    claim:
      "갈비찜의 정석. 양념이 고기 속까지 깊이 배어 있고, 감자와 당근도 완벽하게 익어있다. 매콤달콤한 양념장은 밥 한 그릇을 순식간에 비우게 만든다.",
  },
  {
    restaurant_name: "황소곱창",
    menu_item: "소곱창 구이",
    location: "마포구 합정동",
    category: "고기",
    claim:
      "불판 위에서 기름이 터지면서 익어가는 소곱창. 들기름 소금장에 찍어 먹으면 고소함이 입안 가득. 마무리 볶음밥까지 하면 이 세상 음식이 아니다.",
  },
];

export async function seedData() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "로그인이 필요합니다" };
  }

  const postsToInsert = SEED_POSTS.map((post) => ({
    ...post,
    author_id: user.id,
  }));

  const { error } = await supabase.from("posts").insert(postsToInsert);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
