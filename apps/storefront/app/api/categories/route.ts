import { delay } from "@/shared/lib/utils";
import { NextResponse } from "next/server";

const MOCK_CATEGORIES_DB = [
  {
    id: "cat_01",
    slug: "industrial",
    name: "Industrial Power",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCPkcYjIBimva_BQCq-alfWskfU2-oLC1nfgG6K7131nTYUl8ap-_rpvf5VMzuFhIPay1KbuEWIc-X-FHfmyTA39LVZTvZqv-ABNvwjl20RznJHlSK8a_fPx9BXENN1OojbEq8NyYfhF53vcBCPbEnjG8nIvak-rF5AxCx29v7zAY1SNgWveKSN8cHkhUQk7uwAFyWQUj8k3rHclALDgmx3CAJcFPElHyHzOoX-zRRRr6O-MO7U1JUk0jwQzXX7cTvjlXK3zUvXoiYn",
    description: "Máy phát điện công nghiệp công suất lớn",
  },
  {
    id: "cat_02",
    slug: "household",
    name: "Household Setup",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBcgepRit8EJYYcrmsaLxVPjbtdQt6InD7FMMxYxisYXtVds7jIQEgp5KnHlo4KhbGszEfLci33v5-Gq89qpr9FEwuqOG4QTKyO-3lqgSzP1yRgMnEt7XYSKJymM3RmZZwv8zFF99udq1YA4DZbuOAnHSlnWUWqygbjNz-Z3B2VoUhmjoifzK29TDmSQpJ-C1wVmS_Z1AC-9toV9tZw5xdYy3ywWD1JCTkiUoid_ow5rMxzaQCImwUjY8svC-a-VNoVDW0o_PdZrdXr",
    description: "Giải pháp điện dự phòng cho gia đình",
  },
  {
    id: "cat_03",
    slug: "ups",
    name: "UPS Systems",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDRYugbYlKawKmaUXEpToa9fvl_DuSQYSq2xhtKdwR991tNVYe34YLjEkG6pATbxsyURg2XBjBrsFlyOvEHwkgh0OL4jMHETohKTd9pNY1cdg1EWHY15AO8AyoET4tYVtEypSobqekjG3womVzUB8HjoaoSFn1DZ6IfIcj128Vz9oSabdCuNUqv3AlvgLHb-pbZ4i41msLAP9wFxFNcFX1_Opniv1JS1i1kilWcMB2fVhKoC22PDaoXS6IUhI3lMXi2DJhdQa_eRXVN",
    description: "Bộ lưu điện liên tục chống sập nguồn",
  },
  {
    id: "cat_04",
    slug: "hpgreen",
    name: "HPGreen Energy",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDqvjI8hfIGHjiNc6QTD6_ArLQ0tbxgPTPZLEQJBqakStYHqPZBJpLnwiNv-fKnmawpFXAgGCZbyzzp9fcxKWFmqukYTUVLlZlx3_eXIu5HxOBztiIS69gkbn2gW3_un_qE_pNX5XOf2deY5ArHPauicZvyCCzyu2WmgZ61SAfy5vYTxX0pVIuvvBvBF2lxzp4BAazI4UB8ZWZvdp44CztemkGSUyHwBS0mG99sUcrvOEYcd4EQl8MWA0gn_4t9MIq35WQB6OfNWMjJ",
    description: "Năng lượng xanh thân thiện môi trường",
  },
];

export async function GET() {
  try {
    await delay(800);

    return NextResponse.json(
      {
        status: true,
        data: MOCK_CATEGORIES_DB,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        status: false,
        data: null,
      },
      { status: 500 },
    );
  }
}
