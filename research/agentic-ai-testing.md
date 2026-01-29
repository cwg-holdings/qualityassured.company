# Automated Testing in Agentic AI: CDP, Puppeteer, Playwright, and the Assurance Gap

AI is writing more code, and it is getting merged.[25, 27]

Most teams are still shipping software to humans using screens. The code supply is accelerating, but the assurance workload is not. That mismatch is how you ship faster while learning slower, and how you end up learning the hard way.[23, 24]

For web testing, the stack that holds up is not mysterious. Chrome DevTools Protocol gives you deep control and observability, Puppeteer gives you a programmable automation substrate close to that control plane, and Playwright turns browser control into repeatable experiments with assertions and a waiting model.[1, 7, 9]

This post answers three practical questions. What is CDP good for, and why does Selenium warn you about stability. What should "CDP everywhere" mean if you care about cross browser futures, and why WebDriver BiDi is the standards answer. What does it look like to test interfaces designed for humans when the users now include agents.[3, 5, 21]

## Testing is measurement, not button clicking

UI automation fails in production for boring reasons: race conditions, delayed rendering, async navigation, overlays, and the general unwillingness of reality to align with hard coded waits. Playwright's actionability checks are an explicit attempt to make "can I safely click this now" a framework concern instead of a tribal heuristic.[12]

The web is a concurrent system. Network, rendering, the runtime, and user input are all moving at once. Your test runner is another concurrent system. When a test suite pretends the world is linear, it will punish you for the lie.

When UI tests are flaky, the usual diagnosis is timing. The deeper problem is measurement. If your locator strategy is unstable, your experiment is not reproducible. Playwright's locators are designed to be resolvable again and again and to participate in auto waiting, which is why they function more like measurement instruments than static selectors.[11]

Assertions matter as much as actions. Playwright's test assertions are built to wait and retry in web native ways, which is a practical acknowledgement that a UI is rarely in its final state at the exact instant your code would like it to be.[13]

## One stack, three layers

Chrome DevTools Protocol is a remote debugging protocol that exposes browser internals through commands and events. It is widely used as an automation substrate because it exposes both actuation and observability from the same surface.[1]

Chrome has invested in making CDP tangible for humans, including tooling that helps you author and run CDP commands directly.[2]

CDP is the closest thing the browser has to a control plane. It is an effort I wish we saw everywhere, because it makes the browser debuggable as a system, not just clickable as a page.[1]

Puppeteer sits close to that control plane. It is a JavaScript library that provides a high level API to control Chrome or Firefox over the DevTools Protocol or WebDriver BiDi, and it stays close enough to the metal that you can drop down into protocol level work when you need it.[7]

Playwright sits one level up in intent. It is an end to end testing framework, and it is explicitly positioned around repeatable testing with assertions, with first class support across Chromium, Firefox, and WebKit.[9, 10]

Treat these as layers, not competitors, and you churn less. CDP gives you an observability plane, Puppeteer gives you a scriptable automation substrate near the protocol, and Playwright gives you a rigorous way to describe and assert behavior.

## CDP: the power and the trap

The power is straightforward. CDP gives you a single channel to drive the browser and to observe what happened.[1]

The trap is also straightforward. CDP is not a cross browser testing standard, and Selenium is blunt that CDP is not designed for testing and is not a stable API. Version coupling is not a corner case, it is the default.[3]

If you build your test infrastructure on CDP directly, you are choosing to own a browser version story. That can be a great decision when you need deep telemetry. It is a bad decision when it happens by accident.[3]

This is why "CDP everywhere" is both a reasonable desire and a poor portability strategy. The desire is for a rich, event driven debugging and automation surface across browsers. The portability strategy is standards.[3, 5]

## Standards: WebDriver and WebDriver BiDi

WebDriver is defined as a remote control interface for introspection and control of user agents, with a platform and language neutral wire protocol. It exists so tooling can target browsers without bespoke vendor integration.[4]

Modern web apps also require bidirectional, event driven capabilities. WebDriver BiDi defines a bidirectional protocol intended to support richer automation and observability scenarios than classic request response control alone.[5]

The WebKit standards position issue for BiDi is a useful window into the industry tension: when standards lag behind what engineers need, proprietary protocols fill the gap.[6]

The long term win is "CDP like power with standardization." BiDi is the closest thing to that trajectory today, and it is the direction we want vendors to converge on.[5, 6]

## Puppeteer: an agent substrate hiding in plain sight

Puppeteer is easy to describe as browser automation, but for agentic AI the interesting part is composability. It provides a programmable surface where you can build tools that do not just click, but also observe and explain.[7]

Puppeteer's `CDPSession` is the explicit escape hatch. It exists so you can send raw protocol methods and subscribe to protocol events, which is the foundation for agent tools that need high bandwidth telemetry, not just DOM scraping.[8]

This close to the protocol shape is why Puppeteer is a credible execution layer for agentic systems. Agents need deterministic actuators and rich sensors, and protocol level streams make failures diagnosable rather than mystical.[8]

## Playwright: turning automation into experiments with assertions

Playwright's core value is that it treats UI automation as experimentation. It couples actions with a waiting model, and it bundles assertions and tooling so you can express intent and validate outcomes in repeatable ways.[9, 12, 13]

Its locator strategy pushes you toward user facing semantics and explicit contracts. In practice, that means leaning on accessible roles, names, and visible text rather than fragile DOM structure. This is not only good for test stability. It is a bridge between how humans describe the interface and how a computer can reliably identify it.[11, 14]

Playwright also keeps CDP relevant. It exposes `CDPSession` for raw protocol access, and it documents CDP connectivity on the browser type API. It also warns that CDP connections are Chromium only and significantly lower fidelity than Playwright's native protocol.[15, 16]

## Chrome got this right, WebKit and Safari still feel heavier

CDP is a mature, publicly documented protocol surface, and it is used as the substrate for tooling and automation.[1]

Safari's official automation story is WebDriver. WebKit announced WebDriver support via `safaridriver`, and Apple documents the steps to enable WebDriver on macOS and on iOS and iPadOS, including remote automation controls.[17, 18, 19]

Playwright supports WebKit as a browser engine, which is valuable for cross engine coverage, and it documents browser support boundaries that matter when you are reasoning about Safari in real world test matrices.[10]

The gap is not about whether WebKit can render modern sites. The gap is whether the automation and observability plane feels like a first class, tool builder friendly platform. On Chromium, CDP feels like that. On Safari, the surface is real, but it can feel more constrained and more operationally gated.

## Humans consume interfaces, computers produce them, AI changes the math

Human beings are still the primary consumers of most interfaces. The producer of those interfaces is software, and more of that software is being generated with AI assistance.[23, 24]

GitHub reports that Copilot can complete a substantial share of code in supported contexts and frames material productivity gains from AI assisted development.[23]

Microsoft Research reports controlled experimental evidence that developers with Copilot complete tasks faster, which is another way of saying the code supply curve is steepening.[24]

Public statements from large companies reinforce the same trend. Yahoo Finance reported Sundar Pichai saying more than a quarter of Google's new code is generated by AI and then reviewed and accepted by engineers, Reuters later reported him citing an even higher share, and TechCrunch reported Satya Nadella describing a meaningful fraction of Microsoft's code as AI written.[25, 26, 27]

If the rate of code production goes up and the assurance pipeline stays human scale, quality becomes a governance problem, not a hero problem.[29]

## We should be excited, and we should be worried

We should be excited because the execution layer is real. The guidance is explicit that you can pair a model with browser automation, and that you should sandbox it.[21]

We should be worried because velocity shifts risk. If a meaningful share of new code is being generated by AI and then human reviewed, the pressure moves from writing code to verifying and governing it. That shift is visible in public reporting about code generation shares and in published research showing that AI assistance can correlate with less secure outcomes in certain tasks.[26, 27, 28]

If you want an anchor for corporate decision making, use a risk framework. NIST AI RMF is one such anchor.[29]

## Where AI fits as a user of UIs

AI systems are not only producers of code. They are increasingly consumers of UIs as computer using agents. OpenAI's computer use guidance explicitly recommends pairing a model with a browser automation framework such as Playwright or Selenium and emphasizes sandboxing and safety boundaries.[21]

OpenAI also provides a UI testing agent demo built on this pattern, which is useful as an existence proof that "model plus browser automation" is becoming a standard architecture for agentic QA experiments.[22]

This raises a testing question: how do we validate interfaces designed by humans when the consumer is also a computer. The most pragmatic answer today is to treat semantic layers, especially accessibility roles and names, as the public contract that both tests and agents can target. Playwright's locator guidance and assertions are a blueprint for this approach because they push you toward human readable intent that can still be validated in machine terms.[11, 13]

## Meeting AI code supply with AI testing, without lying to ourselves

"AI testing" should not mean replacing deterministic oracles with hand waving. It should mean using models to scale the parts of testing that humans are bad at doing repeatedly, while keeping execution and pass or fail grounded in stable assertions and observable signals.[13]

In practice, this is where models can do real work without breaking trust. They can propose tests, adapt steps when a UI shifts, and summarize failures in a way a human can act on. The system still needs stable oracles and stable signals, because you cannot govern a pipeline you cannot measure.

The execution layer is already here. Playwright provides test assertions and actionability semantics for reliable experiments, and it exposes CDP where deeper telemetry is needed on Chromium.[12, 13, 15]

The governance layer is also already here, at least in template form. NIST's AI Risk Management Framework is a reminder that speed does not remove responsibility; it moves risk around, and you still have to manage it.[29]

The risk is not hypothetical. "Do Users Write More Insecure Code with AI Assistants?" reports that participants with an AI assistant produced less secure solutions in multiple tasks and were more likely to believe their solutions were secure.[28]

The right posture is controlled optimism. Use the productivity upside, but assume the defect surface expands unless you scale assurance with equal seriousness.

## What this means in production

If you are building software for real users, you need interfaces that are testable, diagnosable, and stable under constant change. That is already true for humans and it becomes not negotiable when agents are also users.

If you want something you can run daily, anchor UI assurance in Playwright's locators and assertions. They give you a workable contract between human intent and machine verification.[11, 13]

Use Puppeteer when you need a scriptable substrate close to the browser, and use CDP when you need deep observability. Just do not sleep on version coupling. Selenium says it out loud.[1, 3, 7]

If you care about cross browser futures, push toward WebDriver BiDi.[5]

None of this removes the need for engineering judgment. It makes that judgment repeatable, measurable, and defensible, which is what professional QA is supposed to do in the first place.[29]

## References

[1] [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/).

[2] [Craft your Chrome DevTools Protocol (CDP) commands](https://developer.chrome.com/blog/cdp-command-editor/).

[3] [Selenium documentation: Chrome DevTools Protocol](https://www.selenium.dev/documentation/webdriver/bidi/cdp/).

[4] [W3C WebDriver](https://www.w3.org/TR/webdriver2/).

[5] [W3C WebDriver BiDi](https://www.w3.org/TR/webdriver-bidi/).

[6] [WebKit standards positions issue 240 on WebDriver BiDi](https://github.com/WebKit/standards-positions/issues/240).

[7] [Puppeteer: What is Puppeteer](https://pptr.dev/guides/what-is-puppeteer).

[8] [Puppeteer API: CDPSession](https://pptr.dev/api/puppeteer.cdpsession).

[9] [Playwright docs: Introduction](https://playwright.dev/docs/intro).

[10] [Playwright docs: Browsers](https://playwright.dev/docs/browsers).

[11] [Playwright docs: Locators](https://playwright.dev/docs/locators).

[12] [Playwright docs: Actionability](https://playwright.dev/docs/actionability).

[13] [Playwright docs: Test assertions](https://playwright.dev/docs/test-assertions).

[14] [Playwright docs: Best practices](https://playwright.dev/docs/best-practices).

[15] [Playwright API: CDPSession](https://playwright.dev/docs/api/class-cdpsession).

[16] [Playwright API: BrowserType](https://playwright.dev/docs/api/class-browsertype).

[17] [WebKit blog: WebDriver Support in Safari 10](https://webkit.org/blog/6900/webdriver-support-in-safari-10/).

[18] [Apple: Enable WebDriver on macOS](https://developer.apple.com/documentation/safari-developer-tools/macos-enabling-webdriver).

[19] [Apple: Enable WebDriver on iOS and iPadOS](https://developer.apple.com/documentation/safari-developer-tools/ios-enabling-webdriver).

[20] [Apple: About WebDriver for Safari](https://developer.apple.com/documentation/webkit/about-webdriver-for-safari).

[21] [OpenAI: Computer use](https://platform.openai.com/docs/guides/tools-computer-use).

[22] [OpenAI testing agent demo](https://github.com/openai/openai-testing-agent-demo).

[23] [GitHub: Economic impact of the AI powered developer lifecycle](https://github.blog/news-insights/research/the-economic-impact-of-the-ai-powered-developer-lifecycle-and-lessons-from-github-copilot/).

[24] [Microsoft Research: The impact of AI on developer productivity](https://www.microsoft.com/en-us/research/publication/the-impact-of-ai-on-developer-productivity-evidence-from-github-copilot/).

[25] [Yahoo Finance: Google CEO says more than 25% of new code is generated by AI](https://finance.yahoo.com/news/google-ceo-says-more-25-202927484.html).

[26] [Reuters: AI vibe coding startups burst onto scene with sky high valuations](https://www.reuters.com/business/ai-vibe-coding-startups-burst-onto-scene-with-sky-high-valuations-2025-06-03/).

[27] [TechCrunch: Microsoft CEO says up to 30% of company code was written by AI](https://techcrunch.com/2025/04/29/microsoft-ceo-says-up-to-30-of-the-companys-code-was-written-by-ai/).

[28] [arXiv: Do Users Write More Insecure Code with AI Assistants?](https://arxiv.org/html/2211.03622v3).

[29] [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework).
