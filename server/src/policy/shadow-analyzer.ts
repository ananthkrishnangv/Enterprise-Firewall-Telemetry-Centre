import ipaddr from 'ipaddr.js';
import { CanonicalRule } from '../types/index.js';

export interface PolicyAnalysisReport {
  firewallId: string;
  totalRules: number;
  shadowedRulesCount: number;
  redundantRulesCount: number;
  anyAnyRulesCount: number;
  averageRiskScore: number;
  findings: PolicyFinding[];
}

export interface PolicyFinding {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  type: 'shadowed' | 'redundant' | 'any_any' | 'logging_disabled' | 'unused';
  message: string;
  remediation: string;
}

export class ShadowAnalyzer {
  public static analyzeRulebase(firewallId: string, rules: CanonicalRule[]): PolicyAnalysisReport {
    const findings: PolicyFinding[] = [];
    let shadowedCount = 0;
    let redundantCount = 0;
    let anyAnyCount = 0;
    let totalRisk = 0;

    // Sort rules by position
    const sorted = [...rules].sort((a, b) => a.position - b.position);

    for (let i = 0; i < sorted.length; i++) {
      const current = sorted[i];

      // 1. Any/Any check
      const isSrcAny = current.sourceCidrs.includes('0.0.0.0/0') || current.sourceCidrs.includes('any');
      const isDstAny = current.destCidrs.includes('0.0.0.0/0') || current.destCidrs.includes('any');
      const isPortAny = current.destPorts.includes('ANY') || current.destPorts.includes('any');

      if (isSrcAny && isDstAny && isPortAny && current.action === 'allow') {
        current.isAnyAny = true;
        current.riskScore = Math.max(current.riskScore, 90);
        anyAnyCount++;
        findings.push({
          id: `find-any-${current.id}`,
          ruleId: current.id,
          ruleName: current.name,
          severity: 'critical',
          type: 'any_any',
          message: `Rule "${current.name}" permits ANY source, ANY destination, and ANY port. High risk of perimeter breach.`,
          remediation: 'Restrict destination to specific subnets and limit allowed ports to verified business services.'
        });
      }

      // 2. Logging check
      if (!current.logging && current.action === 'allow') {
        current.riskScore = Math.max(current.riskScore, 60);
        findings.push({
          id: `find-log-${current.id}`,
          ruleId: current.id,
          ruleName: current.name,
          severity: 'high',
          type: 'logging_disabled',
          message: `Rule "${current.name}" has logging disabled. Violates PCI-DSS 10.2.1 and eliminates audit visibility.`,
          remediation: 'Enable session logging on this policy immediately.'
        });
      }

      // 3. Shadow and Redundancy Check against preceding rules
      for (let j = 0; j < i; j++) {
        const predecessor = sorted[j];
        if (!predecessor.enabled) continue;

        const isSubnetShadowed = this.isRuleSubsumed(current, predecessor);

        if (isSubnetShadowed) {
          if (predecessor.action === current.action) {
            // Redundant Rule
            current.isRedundant = true;
            current.redundantWithRuleId = predecessor.id;
            redundantCount++;
            findings.push({
              id: `find-red-${current.id}`,
              ruleId: current.id,
              ruleName: current.name,
              severity: 'medium',
              type: 'redundant',
              message: `Rule "${current.name}" is completely redundant with earlier Rule #${predecessor.position} ("${predecessor.name}").`,
              remediation: `Safely decommission or merge Rule "${current.name}" into Rule "${predecessor.name}".`
            });
            break;
          } else {
            // Shadowed Rule (preceding rule has different action, so current rule is NEVER reached!)
            current.isShadowed = true;
            current.shadowedByRuleId = predecessor.id;
            current.shadowedByRuleName = predecessor.name;
            shadowedCount++;
            findings.push({
              id: `find-shd-${current.id}`,
              ruleId: current.id,
              ruleName: current.name,
              severity: 'high',
              type: 'shadowed',
              message: `Rule "${current.name}" (Action: ${current.action}) will never be evaluated because Rule #${predecessor.position} ("${predecessor.name}", Action: ${predecessor.action}) matches all its traffic first.`,
              remediation: `Reorder Rule "${current.name}" ahead of Rule "${predecessor.name}" or remove it.`
            });
            break;
          }
        }
      }

      // 4. Unused Rule Check
      if (current.hitCount === 0 && current.unusedDays >= 90) {
        findings.push({
          id: `find-unused-${current.id}`,
          ruleId: current.id,
          ruleName: current.name,
          severity: 'low',
          type: 'unused',
          message: `Rule "${current.name}" has 0 recorded hits in the past ${current.unusedDays} days. Potential dead policy rule.`,
          remediation: 'Verify with policy owner and schedule for recertification or retirement.'
        });
      }

      totalRisk += current.riskScore;
    }

    return {
      firewallId,
      totalRules: sorted.length,
      shadowedRulesCount: shadowedCount,
      redundantRulesCount: redundantCount,
      anyAnyRulesCount: anyAnyCount,
      averageRiskScore: sorted.length > 0 ? Math.round(totalRisk / sorted.length) : 0,
      findings
    };
  }

  private static isRuleSubsumed(candidate: CanonicalRule, predecessor: CanonicalRule): boolean {
    // Check if predecessor source subsumes candidate source
    const srcSubsumed = this.isCidrListSubsumed(candidate.sourceCidrs, predecessor.sourceCidrs);
    if (!srcSubsumed) return false;

    // Check if predecessor destination subsumes candidate destination
    const dstSubsumed = this.isCidrListSubsumed(candidate.destCidrs, predecessor.destCidrs);
    if (!dstSubsumed) return false;

    // Check protocol
    const protoSubsumed = predecessor.protocols.includes('ANY') || predecessor.protocols.some(p => candidate.protocols.includes(p));
    if (!protoSubsumed) return false;

    // Check ports
    const portsSubsumed = predecessor.destPorts.includes('ANY') || predecessor.destPorts.some(p => candidate.destPorts.includes(p));
    if (!portsSubsumed) return false;

    return true;
  }

  private static isCidrListSubsumed(candidateCidrs: string[], predCidrs: string[]): boolean {
    if (predCidrs.includes('0.0.0.0/0') || predCidrs.includes('any') || predCidrs.includes('Any')) {
      return true;
    }

    for (const cand of candidateCidrs) {
      let matched = false;
      for (const pred of predCidrs) {
        if (this.cidrContains(pred, cand)) {
          matched = true;
          break;
        }
      }
      if (!matched) return false;
    }
    return true;
  }

  private static cidrContains(parentCidr: string, childCidr: string): boolean {
    if (parentCidr === '0.0.0.0/0' || parentCidr.toLowerCase() === 'any') return true;
    if (childCidr === '0.0.0.0/0' || childCidr.toLowerCase() === 'any') return false;

    try {
      const parentParsed = ipaddr.parseCIDR(parentCidr.includes('/') ? parentCidr : `${parentCidr}/32`);
      const childParsed = ipaddr.parseCIDR(childCidr.includes('/') ? childCidr : `${childCidr}/32`);
      
      const parentRange = parentParsed[0];
      const parentPrefix = parentParsed[1];
      const childIp = childParsed[0];
      const childPrefix = childParsed[1];

      if (childPrefix < parentPrefix) return false;
      return childIp.match(parentRange, parentPrefix);
    } catch {
      return false;
    }
  }
}
