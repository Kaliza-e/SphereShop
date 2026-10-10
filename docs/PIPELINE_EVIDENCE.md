# SphereShop — CI/CD Pipeline Evidence

This document details the `.gitlab-ci.yml` pipeline stages and proves that a failing unit test stops the deployment stage.

---

## 1. Pipeline Stages
1. **Build Stage (`build_job`)**:
   - Compiles TypeScript for `api` and builds static Vite production bundle for `web`.
   - Produces build artifacts (`api/dist` and `web/dist`).
2. **Test Stage**:
   - `unit_test_coverage_job`: Runs `npm test` across unit and integration test suites with code coverage reporting. Coverage threshold set to >= 70%.
   - `dependency_vulnerability_scan`: Runs `npm audit` to check high/critical security advisories.
   - `secret_scanning`: Scans codebase for hardcoded passwords, tokens, or credentials.
3. **Deploy Stage (`deploy_uat`)**:
   - Executes `kubectl apply -f k8s/` to deploy updated manifests to the UAT Kubernetes cluster.

---

## 2. Proof: Failing Unit Test Blocks Deployment
When a deliberately failing assertion is introduced in a throwaway branch (e.g. `expect(1 + 1).toBe(3)` in `pricing.test.ts`):
1. `unit_test_coverage_job` exits with code 1.
2. GitLab CI halts pipeline execution immediately at the **Test** stage.
3. The `deploy_uat` job in the **Deploy** stage is marked as `canceled` / `skipped` and is never executed.
4. Deployment to UAT is prevented until all unit and coverage tests pass.
