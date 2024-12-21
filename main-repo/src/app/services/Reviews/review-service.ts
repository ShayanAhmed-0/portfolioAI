import { prismaClient } from "../../../lib/db";
import { gethashedPass } from "../../../utils/generate-hash";
import { generateSalt } from "../../../utils/generate-salt";

export default class ReviewService {
  public static userReviews(userProfileId: string) {
    return prismaClient.reviews.findMany({
      where: {
        ordersDetails: {
          userProfileId,
        },
      },
    });
  }
  public static vendorReviews(vendorProfileId: string) {
    return prismaClient.reviews.findMany({
      where: {
        ordersDetails: {
          orders: {
            some: {
              dish: {
                category: {
                  vendorProfileId,
                },
              },
            },
          },
        },
      },
    });
  }
  public static async giveReview(
    rating: number,
    review: string,
    ordersDetailsId: string,
    imageData: {
      name: string;
      url: string;
    }[]
  ) {
    return prismaClient.reviews.create({
      data: {
        rating,
        review,
        ordersDetailsId,
        images: {
          createMany: {
            data: imageData,
          },
        },
      },
      select: {
        ordersDetails: {
          select: {
            orders: {
              select: {
                dish: {
                  select: {
                    category: {
                      select: {
                        vendorProfileId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
