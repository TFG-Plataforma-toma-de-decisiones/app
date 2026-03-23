export function getRelations(node) {
  return Array.isArray(node?.relations) ? node.relations : [];
}

export function getRelationChildren(node) {
  return getRelations(node).flatMap((relation) => relation.children ?? []);
}

export function hasRelations(node) {
  return getRelations(node).length > 0;
}

export function collectFeatureNames(node, mandatoryOnly = false) {
  let featureNames = [node.name];

  for (const relation of getRelations(node)) {
    if (mandatoryOnly && relation.type !== "MANDATORY") {
      continue;
    }

    for (const child of relation.children ?? []) {
      featureNames = featureNames.concat(collectFeatureNames(child, mandatoryOnly));
    }
  }

  return featureNames;
}

export function findRootFeatureNode(rootNode, featureName) {
  return getRelationChildren(rootNode).find((feature) => feature.name === featureName);
}
