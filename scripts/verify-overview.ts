import { computeOverview } from "../src/services/mock/compute-overview";
import { computePublishingTime } from "../src/services/mock/publishing-time";
import { computeContentType } from "../src/services/mock/content-type";
import { computeBuildingBlock } from "../src/services/mock/building-block";
import {
  emptyBuildingBlock,
  emptyContentType,
  emptyOverview,
  emptyPublishingTime,
} from "../src/services/mock/empty";
import { CLUSTERS } from "../src/config/clusters";
import { PLATFORMS, VISIBLE_PLATFORMS } from "../src/config/platforms";
import { BUILDING_BLOCKS, CONTENT_FORMATS } from "../src/config/content-elements";
import { addDays, format } from "date-fns";

const to = format(new Date(), "yyyy-MM-dd");
const from = format(addDays(new Date(), -29), "yyyy-MM-dd");

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) {
    failures++;
    console.log(`FAIL  ${name} ${detail}`);
  }
}

function verifyCluster(cluster: string) {
  const data = computeOverview({ from, to, cluster });
  const tag = `[${cluster}]`;

  check(`${tag} kpis=4`, data.kpis.length === 4, `got ${data.kpis.length}`);
  const labels = data.kpis.map((k) => k.label).join("|");
  check(
    `${tag} kpi labels`,
    labels === "Total tayangan|Interaksi pembaca|Tingkat interaksi|Jumlah konten",
    labels
  );
  check(`${tag} views>0`, data.kpis[0].value > 0, `${data.kpis[0].value}`);
  check(`${tag} engagement>0`, data.kpis[1].value > 0, `${data.kpis[1].value}`);
  check(
    `${tag} engagementRate 0..100`,
    data.kpis[2].value >= 0 && data.kpis[2].value <= 100,
    `${data.kpis[2].value}`
  );
  check(`${tag} posts>=0`, data.kpis[3].value >= 0, `${data.kpis[3].value}`);
  check(`${tag} posts label`, data.kpis[3].label === "Jumlah konten");

  check(
    `${tag} trend points=30`,
    data.trend.points.length === 30,
    `${data.trend.points.length}`
  );
  const t0 = data.trend.points[0] ?? {};
  check(
    `${tag} trend keys`,
    ["reach", "impressions", "views", "engagement", "engagementRate", "posts"].every(
      (k) => k in t0
    )
  );

  check(
    `${tag} comparison=${VISIBLE_PLATFORMS.length}`,
    data.comparison.length === VISIBLE_PLATFORMS.length
  );
  check(
    `${tag} no hidden platform`,
    data.comparison.every((point) => point.platform !== "x")
  );

  check(
    `${tag} summaries=${VISIBLE_PLATFORMS.length}`,
    data.platformSummaries.length === VISIBLE_PLATFORMS.length
  );
  const shareSum = data.platformSummaries.reduce(
    (sum, s) => sum + s.viewsSharePercent,
    0
  );
  check(
    `${tag} share sum ~100`,
    Math.abs(shareSum - 100) <= 1.5,
    shareSum.toFixed(1)
  );

  check(`${tag} buckets=3`, data.contentBuckets.length === 3);
  for (const bucket of data.contentBuckets) {
    check(`${tag} ${bucket.key} <=5`, bucket.posts.length <= 5);
    for (const post of bucket.posts) {
      const v = post.metrics.views;
      if (bucket.medianViews > 0 && data.kpis[3].value >= 6) {
        if (bucket.key === "breakout")
          check(`${tag} breakout >=2x med`, v >= bucket.medianViews * 2, `${v}/${bucket.medianViews}`);
        if (bucket.key === "growing")
          check(
            `${tag} growing 1x..2x`,
            v >= bucket.medianViews && v < bucket.medianViews * 2,
            `${v}/${bucket.medianViews}`
          );
        if (bucket.key === "lowLight")
          check(`${tag} lowLight <0.5x`, v < bucket.medianViews * 0.5, `${v}/${bucket.medianViews}`);
      }
    }
  }
  const totalBucketPosts = data.contentBuckets.reduce(
    (sum, b) => sum + b.posts.length,
    0
  );
  check(`${tag} some bucket content`, totalBucketPosts > 0 || data.kpis[3].value === 0);

  check(`${tag} web kpis=3`, data.webStats.kpis.length === 3);
  check(
    `${tag} web labels`,
    data.webStats.kpis.map((k) => k.label).join("|") ===
      "Jumlah PV|Uniq Visitor|Engagement Rate",
    data.webStats.kpis.map((k) => k.label).join("|")
  );
  check(`${tag} web pv>0`, data.webStats.kpis[0].value > 0);
  check(`${tag} web uv>0`, data.webStats.kpis[1].value > 0);
  check(
    `${tag} web er 0..100`,
    data.webStats.kpis[2].value > 0 && data.webStats.kpis[2].value < 100
  );
  check(`${tag} web points=30`, data.webStats.points.length === 30);
  const webT0 = data.webStats.points[0] ?? {};
  check(
    `${tag} web spark keys`,
    "pv" in webT0 && "uniqueVisitors" in webT0 && "engagementRate" in webT0
  );

  check(`${tag} articles<=5`, data.topArticles.length <= 5);
  check(`${tag} articles>=5`, data.topArticles.length === 5, `${data.topArticles.length}`);
  if (data.topArticles.length > 1) {
    check(
      `${tag} articles sorted by pv`,
      data.topArticles.every(
        (a, i) => i === 0 || data.topArticles[i - 1].pv >= a.pv
      )
    );
  }

  check(`${tag} topics=15`, data.topicRecommendations.length === 15, `${data.topicRecommendations.length}`);
  for (const t of data.topicRecommendations) {
    check(`${tag} topic score 0..100`, t.score >= 0 && t.score <= 100);
    check(`${tag} topic count>0`, t.contentCount > 0);
    check(`${tag} topic views>0`, t.views > 0, `${t.views}`);
    check(`${tag} topic title`, t.title.length > 0);
  }
  check(
    `${tag} topics sorted by score`,
    data.topicRecommendations.every(
      (t, i) =>
        i === 0 ||
        data.topicRecommendations[i - 1].score >= t.score
    )
  );
  return data;
}

function verifyPublishingTime() {
  const scopes: {
    name: string;
    query: Parameters<typeof computePublishingTime>[0];
  }[] = [
    { name: "all", query: { from, to, cluster: "all" } },
    { name: "cluster", query: { from, to, cluster: "News" } },
    ...VISIBLE_PLATFORMS.map((platform) => ({
      name: platform.id,
      query: { from, to, platform: platform.id },
    })),
    {
      name: "single-account",
      query: {
        from,
        to,
        platform: "instagram" as const,
        accountId: "ig-acc-1",
      },
    },
  ];

  for (const scope of scopes) {
    const data = computePublishingTime(scope.query);
    const tag = `[pt:${scope.name}]`;
    check(`${tag} points=15`, data.points.length === 15, `${data.points.length}`);
    check(
      `${tag} hours 07..21`,
      data.points.every((point, index) => point.hour === 7 + index),
      data.points.map((p) => p.hour).join(",")
    );
    check(
      `${tag} labels`,
      data.points[0]?.label === "07.00" && data.points[14]?.label === "21.00",
      `${data.points[0]?.label}..${data.points[14]?.label}`
    );
    check(
      `${tag} totals>0`,
      data.totals.content > 0 && data.totals.views > 0 && data.totals.engagements > 0,
      JSON.stringify(data.totals)
    );
    for (const point of data.points) {
      check(`${tag} ${point.label} content>=1`, point.content >= 1, `${point.content}`);
      check(`${tag} ${point.label} views>=1`, point.views >= 1, `${point.views}`);
      check(
        `${tag} ${point.label} engagements>=1`,
        point.engagements >= 1,
        `${point.engagements}`
      );
    }
    const sum = (key: "content" | "views" | "engagements") =>
      data.points.reduce((total, point) => total + point[key], 0);
    check(`${tag} views sum==total`, sum("views") === data.totals.views, `${sum("views")}/${data.totals.views}`);
    check(
      `${tag} engagements sum==total`,
      sum("engagements") === data.totals.engagements,
      `${sum("engagements")}/${data.totals.engagements}`
    );
    if (data.totals.content >= 15) {
      check(
        `${tag} content sum==total`,
        sum("content") === data.totals.content,
        `${sum("content")}/${data.totals.content}`
      );
    }
    if (scope.name === "all") {
      const top3 = [...data.points]
        .sort((a, b) => b.content - a.content)
        .slice(0, 3)
        .map((p) => p.hour)
        .sort((a, b) => a - b);
      const expected = [8, 16, 20];
      check(
        `${tag} peak content hours = 08,16,20`,
        top3.every((hour, index) => hour === expected[index]),
        top3.join(",")
      );
    }
  }
}

function verifyContentType() {
  const scopes: {
    name: string;
    query: Parameters<typeof computeContentType>[0];
  }[] = [
    { name: "all", query: { from, to, cluster: "all" } },
    { name: "cluster", query: { from, to, cluster: "News" } },
    ...VISIBLE_PLATFORMS.map((platform) => ({
      name: platform.id,
      query: { from, to, platform: platform.id },
    })),
    {
      name: "single-account",
      query: {
        from,
        to,
        platform: "instagram" as const,
        accountId: "ig-acc-1",
      },
    },
  ];

  for (const scope of scopes) {
    const data = computeContentType(scope.query);
    const tag = `[ct:${scope.name}]`;
    check(
      `${tag} formats=3`,
      data.formats.length === CONTENT_FORMATS.length,
      `${data.formats.length}`
    );
    check(
      `${tag} format keys`,
      data.formats.every((point) => CONTENT_FORMATS.includes(point.format))
    );
    check(
      `${tag} content sum==totals`,
      data.formats.reduce((sum, point) => sum + point.content, 0) ===
        data.totals.content,
      `${data.formats.reduce((sum, p) => sum + p.content, 0)}/${data.totals.content}`
    );
    check(
      `${tag} views sum==totals`,
      data.formats.reduce((sum, point) => sum + point.views, 0) ===
        data.totals.views
    );
    check(
      `${tag} non-negative`,
      data.formats.every(
        (point) =>
          point.content >= 0 &&
          point.views >= 0 &&
          point.engagements >= 0 &&
          point.newFollowers >= 0
      )
    );
    if (scope.name === "all") {
      check(`${tag} totals>0`, data.totals.content > 0, `${data.totals.content}`);
      check(
        `${tag} every format used`,
        data.formats.every((point) => point.content > 0),
        data.formats.map((p) => `${p.format}:${p.content}`).join(" ")
      );
      check(`${tag} newFollowers>0`, data.totals.newFollowers > 0);
    }
  }
}

function verifyBuildingBlock() {
  const scopes: {
    name: string;
    query: Parameters<typeof computeBuildingBlock>[0];
  }[] = [
    { name: "all", query: { from, to, cluster: "all" } },
    { name: "cluster", query: { from, to, cluster: "Bisnis" } },
    ...VISIBLE_PLATFORMS.map((platform) => ({
      name: platform.id,
      query: { from, to, platform: platform.id },
    })),
    {
      name: "single-account",
      query: {
        from,
        to,
        platform: "tiktok" as const,
        accountId: "tt-acc-2",
      },
    },
  ];

  for (const scope of scopes) {
    const data = computeBuildingBlock(scope.query);
    const tag = `[bb:${scope.name}]`;
    check(
      `${tag} blocks<=5`,
      data.blocks.length <= 5 && data.blocks.length > 0,
      `${data.blocks.length}`
    );
    check(
      `${tag} known blocks`,
      data.blocks.every((point) => BUILDING_BLOCKS.includes(point.block))
    );
    check(
      `${tag} unique blocks`,
      new Set(data.blocks.map((point) => point.block)).size ===
        data.blocks.length
    );
    for (const point of data.blocks) {
      check(
        `${tag} ${point.block} avg consistency`,
        point.content > 0
          ? point.viewsPerContent === Math.round(point.views / point.content)
          : point.viewsPerContent === 0,
        `${point.viewsPerContent} vs ${point.views}/${point.content}`
      );
      check(
        `${tag} ${point.block} non-negative`,
        point.content >= 0 &&
          point.views >= 0 &&
          point.engagements >= 0 &&
          point.viewsPerContent >= 0 &&
          point.engagementsPerContent >= 0
      );
    }
    if (scope.name === "all") {
      check(`${tag} blocks=5`, data.blocks.length === 5, `${data.blocks.length}`);
      check(
        `${tag} every block used`,
        data.blocks.every((point) => point.content > 0),
        data.blocks.map((p) => `${p.block}:${p.content}`).join(" ")
      );
    }
  }
}

function verifyAccounts() {
  const allIds = PLATFORMS.flatMap((platform) =>
    platform.accounts.map((account) => account.id)
  );
  check(
    "account ids unique",
    new Set(allIds).size === allIds.length,
    `${new Set(allIds).size}/${allIds.length}`
  );
  check("25 accounts total", allIds.length === 25, `${allIds.length}`);
  for (const platform of PLATFORMS) {
    const tag = `[acc:${platform.id}]`;
    check(`${tag} 5 accounts`, platform.accounts.length === 5, `${platform.accounts.length}`);
    check(
      `${tag} kumparan names`,
      platform.accounts.every((account) => account.name.startsWith("kumparan")),
      platform.accounts.map((a) => a.name).join(",")
    );
    check(
      `${tag} id pattern`,
      platform.accounts.every((account, index) =>
        account.id.endsWith(`-acc-${index + 1}`)
      ),
      platform.accounts.map((a) => a.id).join(",")
    );
    const socials = ["instagram", "tiktok", "x"];
    if (socials.includes(platform.id)) {
      check(
        `${tag} at-handle`,
        platform.accounts.every((account) => account.handle.startsWith("@")),
        platform.accounts.map((a) => a.handle).join(",")
      );
      check(
        `${tag} lowercase handle`,
        platform.accounts.every(
          (account) => account.handle === account.handle.toLowerCase()
        ),
        platform.accounts.map((a) => a.handle).join(",")
      );
    }
  }
}

const all = verifyCluster("all");
const perCluster = new Map(CLUSTERS.map((c) => [c, verifyCluster(c)]));

verifyPublishingTime();
verifyContentType();
verifyBuildingBlock();
verifyAccounts();

const allPosts = all.kpis[3].value;
const clusterPostSum = [...perCluster.values()].reduce(
  (sum, d) => sum + d.kpis[3].value,
  0
);
check(
  "cluster post sum == all",
  clusterPostSum === allPosts,
  `${clusterPostSum} vs ${allPosts}`
);

const defaultTopics = JSON.stringify(
  all.topicRecommendations.map((t) => t.title)
);
const newsTopics = JSON.stringify(
  perCluster.get("News")!.topicRecommendations.map((t) => t.title)
);
check("cluster topics differ", defaultTopics !== newsTopics);

const empty = emptyOverview();
check("empty shape", empty.kpis.length === 4 && empty.webStats.kpis.length === 3);
check("empty buckets", empty.contentBuckets.length === 0);
check("empty articles", empty.topArticles.length === 0);

const emptyPt = emptyPublishingTime();
check("empty pt points=15", emptyPt.points.length === 15, `${emptyPt.points.length}`);
check("empty pt totals=0", emptyPt.totals.content === 0 && emptyPt.totals.views === 0);

const emptyCt = emptyContentType();
check(
  "empty ct formats=3",
  emptyCt.formats.length === CONTENT_FORMATS.length,
  `${emptyCt.formats.length}`
);
check("empty ct totals=0", emptyCt.totals.content === 0 && emptyCt.totals.newFollowers === 0);

const emptyBb = emptyBuildingBlock();
check("empty bb blocks=5", emptyBb.blocks.length === BUILDING_BLOCKS.length, `${emptyBb.blocks.length}`);
check(
  "empty bb zeros",
  emptyBb.blocks.every((point) => point.content === 0 && point.viewsPerContent === 0)
);

console.log(
  `\nall: views=${all.kpis[0].value} engagement=${all.kpis[1].value} er=${all.kpis[2].value} posts=${allPosts}`
);
for (const [cluster, data] of perCluster) {
  console.log(
    `  ${cluster.padEnd(14)} views=${String(data.kpis[0].value).padStart(9)} posts=${String(data.kpis[3].value).padStart(3)} buckets=${data.contentBuckets
      .map((b) => b.posts.length)
      .join("/")}`
  );
}
console.log(
  `\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} FAILURES`}`
);
process.exit(failures === 0 ? 0 : 1);
