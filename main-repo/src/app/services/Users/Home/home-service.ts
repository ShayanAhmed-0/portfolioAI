import { prismaClient } from "../../../../lib/db";

interface CuisineType {
  id: string;
}
export default class HomeService {
  //   public static async getHome() {
  //     return prismaClient.vendorProfile.findMany({
  //       include: {
  //         media: { select: { url: true, name: true } },
  //         category: { include: { dishes: true } },
  //       },
  //     });
  //   }
  // public static async getFavourites(userProfileId: string) {
  //   return prismaClient.userProfile.findMany({
  //     where: {
  //       id: userProfileId,
  //     },
  //     select: {
  //       favourites: {
  //         select: {
  //           vendorProfile: {
  //             select: {
  //               id: true,
  //               businessName: true,
  //               latitude: true,
  //               longitude: true,
  //               media: {
  //                 where: {
  //                   name: "avatar",
  //                 },
  //                 select: {
  //                   url: true,
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });
  //   // return prismaClient.dish.findMany({
  //   //   where: {
  //   //     category: { vendorProfile: { isDeleted: false, isApproved: true } },
  //   //     : {
  //   //       some: { id: userProfileId, auth: { isDeleted: false } },
  //   //     },
  //   //   },
  //   //   select: {
  //   //     id: true,
  //   //     discount: true,
  //   //     ingredients: true,
  //   //     name: true,
  //   //     price: true,
  //   //     sold: true,
  //   //     totalPrice: true,
  //   //     category: {
  //   //       select: { id: true, name: true, image: { select: { url: true } } },
  //   //     },
  //   //     image: { select: { url: true } },
  //   //   },
  //   // });
  // }

  // public static async findFavById(id: string, userProfileId: string) {
  //   console.log("finding fav");
  //   const a = await prismaClient.dish.findFirst({
  //     where: {
  //       id,
  //       userProfile: {
  //         some: { id: userProfileId, auth: { isDeleted: false } },
  //       },
  //     },
  //   });
  //   console.log(a);
  //   return a;
  // }

  // public static async addToFavById(id: string, userProfileId: string) {
  //   return prismaClient.dish.update({
  //     where: { id },
  //     data: { UserProfile: { connect: { id: userProfileId } } },
  //   });
  // }
  // public static async deleteFromFavById(id: string, userProfileId: string) {
  //   return prismaClient.dish.update({
  //     where: {
  //       id,
  //     },
  //     data: {
  //       UserProfile: {
  //         disconnect: { id: userProfileId },
  //       },
  //     },
  //   });
  // }

  public static async allDishes() {
    return prismaClient.dish.findMany({
      where: {
        category: {
          vendorProfile: {
            isApproved: true,
            isDeleted: false,
          },
        },
      },
      select: {
        image: { select: { url: true } },
        name: true,
        category: {
          select: {
            name: true,
            vendorProfile: {
              select: { businessName: true, locationName: true, id: true },
            },
          },
        },
      },
    });
  }
  public static async dishesWithDiscount() {
    return prismaClient.dish.findMany({
      where: {
        discount: { gt: 0 },
        category: { vendorProfile: { isApproved: true, isDeleted: false } },
      },
      select: {
        image: { select: { url: true } },
        discount: true,
        name: true,
        category: {
          select: {
            name: true,
            vendorProfile: {
              select: { businessName: true, locationName: true, id: true },
            },
          },
        },
      },
    });
  }
  public static async dishWithMaxDiscount() {
    return prismaClient.dish.findFirst({
      where: {
        discount: { gt: 0 },
        category: { vendorProfile: { isApproved: true, isDeleted: false } },
      },
      select: {
        image: { select: { url: true } },
        discount: true,
        name: true,
        category: {
          select: {
            name: true,
            vendorProfile: {
              select: { businessName: true, locationName: true, id: true },
            },
          },
        },
      },
      orderBy: { discount: "desc" },
      take: 1,
    });
  }

  public static async getFiltered(price: number, cuisineTypes?: string[]) {
    // const reviewQuery = prismaClient.reviews.count({
    //   where: {
    //     order: {
    //       dish: {
    //         category: {
    //           vendorProfile: {
    //             isApproved: true,
    //             isDeleted: false,
    //           },
    //         },
    //       },
    //     },
    //   },
    // });

    return await prismaClient.vendorProfile.findMany({
      where: {
        isApproved: true,
        isDeleted: false,
        category: {
          some: {
            dishes: {
              some: {
                totalPrice: { lte: price },
              },
            },
          },
        },
        cuisineTypes: { some: { name: { in: cuisineTypes } } },
      },
      select: {
        id: true,
        category: {
          select: {},
        },

        media: {
          where: { name: "avatar" },
          select: { id: true, url: true, name: true },
        },
        businessName: true,
        cuisineTypes: {
          select: {
            name: true,
          },
        },
      },
    });
    // return await prismaClient.dish.findMany({
    //   where: {
    //     totalPrice: { lte: price },
    //     category: {
    //       vendorProfile: {
    //         isApproved: true,
    //         isDeleted: false,
    //         cuisineTypes: { some: { id: { in: cuisineTypes } } },
    //       },
    //     },
    //   },
    //   select: {
    //     image: { select: { url: true } },
    //     discount: true,
    //     name: true,
    //     category: {
    //       select: {
    //         name: true,
    //         vendorProfile: {
    //           select: { businessName: true, locationName: true, id: true },
    //         },
    //       },
    //     },
    //   },
    // });
  }

  public static async getMinVendorById(id: string) {
    const profilesQuery = prismaClient.vendorProfile.findUnique({
      where: { id, isApproved: true, isDeleted: false },
      select: {
        businessName: true,
        media: {
          where: { name: "avatar" },
          select: { id: true, url: true, name: true },
        },
      },
    });

    const reviweQuery = prismaClient.reviews.aggregate({
      where: {
        ordersDetails: {
          orders: {
            some: {
              dish: {
                category: {
                  vendorProfileId: id,
                },
              },
            },
          },
        },
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    const [profiles, rev] = await Promise.all([profilesQuery, reviweQuery]);
    return {
      profiles,
      ReviewsCount: profiles ? rev : 0,
    };
  }

  public static async getVendors() {
    return prismaClient.vendorProfile.findMany({
      where: {
        isApproved: true,
        isDeleted: false,
      },
      select: {
        businessName: true,
        media: {
          where: { name: "avatar" },
          select: { id: true, url: true, name: true },
        },
        category: {
          select: { dishes: { select: { _count: true } } },
        },
        // Reviews: { select: { id: true } },
      },
    });
  }
}
// });

// const reviewQuery = prismaClient.reviews.count({
//   where: {
//     order: {
//       dish: {
//         category: {
//           vendorProfile: {
//             isApproved: true,
//             isDeleted: false,
//           },
//         },
//       },
//     },
//   },
// });

// const [review, profiles] = await Promise.all([reviewQuery, profilesQuery]);
// const profilesWithReviewsCount = profiles.map((profile: any) => {
//   return {
//     ...profile,
//     ReviewsCount: review,
//   };
// });

// return profilesWithReviewsCount;
