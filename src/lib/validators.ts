import { z } from "zod/v4";

export const postSchema = z.object({
  restaurant_name: z
    .string()
    .min(1, "가게 이름을 입력해주세요")
    .max(50, "가게 이름은 50자 이내로 입력해주세요"),
  menu_item: z
    .string()
    .min(1, "메뉴를 입력해주세요")
    .max(50, "메뉴는 50자 이내로 입력해주세요"),
  location: z
    .string()
    .min(1, "위치를 입력해주세요")
    .max(100, "위치는 100자 이내로 입력해주세요"),
  category: z.string().min(1, "카테고리를 선택해주세요"),
  claim: z
    .string()
    .min(10, "독보적인 이유를 10자 이상 입력해주세요")
    .max(500, "독보적인 이유는 500자 이내로 입력해주세요"),
});

export const challengeSchema = z
  .object({
    type: z.enum(["인정", "도전"]),
    reason: z
      .string()
      .min(5, "이유를 5자 이상 입력해주세요")
      .max(300, "이유는 300자 이내로 입력해주세요"),
    alt_restaurant_name: z.string().optional(),
    alt_menu_item: z.string().optional(),
    alt_location: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "도전") {
        return (
          data.alt_restaurant_name &&
          data.alt_restaurant_name.length > 0 &&
          data.alt_menu_item &&
          data.alt_menu_item.length > 0
        );
      }
      return true;
    },
    {
      message: "도전 시 대안 가게와 메뉴를 입력해주세요",
    }
  );

export type PostFormData = z.infer<typeof postSchema>;
export type ChallengeFormData = z.infer<typeof challengeSchema>;
