# The Last Maintainer — Extinction Index

Generated: 2026-08-25T12:19:26.093Z

Evidence digest: `a2b0ebf75762cd2014781084fdb73b760db72a8bfe1dc97cc763034c4ddd1f03`

| Package | Score | Decision | Monthly downloads | Days since release | Archived | Deprecated |
|---|---:|---|---:|---:|---|---|
| request | 73.4 | INVESTIGATE | 57,120,277 | 2386 | no | yes |
| react-beautiful-dnd | 72.8 | INVESTIGATE | 9,166,072 | 1456 | yes | yes |
| node-sass | 69.3 | INVESTIGATE | 3,795,870 | 1193 | yes | yes |
| csurf | 65.7 | INVESTIGATE | 1,852,556 | 2410 | yes | yes |
| inflight | 60.6 | INVESTIGATE | 361,649,384 | 3603 | yes | yes |
| express-graphql | 60.0 | WATCH | 1,270,655 | 2104 | yes | yes |
| tslint | 57.1 | WATCH | 7,633,047 | 2215 | yes | yes |
| enzyme | 51.4 | WATCH | 5,419,362 | 2440 | no | no |

## Machine decision

The highest-ranked package is **request** at **73.4**. Its current disposition is **INVESTIGATE**.

The next gate is migration-cost validation for: **request**, **react-beautiful-dnd**, **node-sass**, **csurf**, **inflight**. Adoption is forbidden until at least one real organization demonstrates costly dependency on the package.

## What the score means

The score combines live package demand, evidence of abandonment, difficulty of replacement, compatibility burden, and enterprise relevance. It ranks where continuity may be economically valuable; it is not a security rating and it does not declare ownership of upstream projects.

## Evidence

- **request:** [npm metadata](https://registry.npmjs.org/request), [download evidence](https://api.npmjs.org/downloads/point/last-month/request), [source repository](https://github.com/request/request). Large legacy surface, but migration to modern HTTP clients is usually possible.
- **react-beautiful-dnd:** [npm metadata](https://registry.npmjs.org/react-beautiful-dnd), [download evidence](https://api.npmjs.org/downloads/point/last-month/react-beautiful-dnd), [source repository](https://github.com/atlassian/react-beautiful-dnd). Archived UI dependency embedded in many mature React applications.
- **node-sass:** [npm metadata](https://registry.npmjs.org/node-sass), [download evidence](https://api.npmjs.org/downloads/point/last-month/node-sass), [source repository](https://github.com/sass/node-sass). Native runtime compatibility is painful, although Dart Sass is a strong successor.
- **csurf:** [npm metadata](https://registry.npmjs.org/csurf), [download evidence](https://api.npmjs.org/downloads/point/last-month/csurf), [source repository](https://github.com/expressjs/csurf). Security-sensitive Express middleware with substantial installed legacy usage.
- **inflight:** [npm metadata](https://registry.npmjs.org/inflight), [download evidence](https://api.npmjs.org/downloads/point/last-month/inflight), [source repository](https://github.com/isaacs/inflight-DEPRECATED-DO-NOT-USE). Huge transitive usage but a narrow API and straightforward replacement path.
- **express-graphql:** [npm metadata](https://registry.npmjs.org/express-graphql), [download evidence](https://api.npmjs.org/downloads/point/last-month/express-graphql), [source repository](https://github.com/graphql/express-graphql). Deprecated integration layer with a documented successor and meaningful legacy usage.
- **tslint:** [npm metadata](https://registry.npmjs.org/tslint), [download evidence](https://api.npmjs.org/downloads/point/last-month/tslint), [source repository](https://github.com/palantir/tslint). Large historical footprint, but the ecosystem has standardized on ESLint.
- **enzyme:** [npm metadata](https://registry.npmjs.org/enzyme), [download evidence](https://api.npmjs.org/downloads/point/last-month/enzyme), [source repository](https://github.com/enzymejs/enzyme). Legacy React test suites can be expensive to rewrite and newer React support is fragmented.
