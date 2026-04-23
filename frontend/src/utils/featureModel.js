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

export function addFeatureSubtree(features, feature) {
  return [...new Set(features.concat(collectFeatureNames(feature, true)))];
}

export function removeFeatureSubtree(features, feature) {
  const subtree = collectFeatureNames(feature, false);
  return features.filter((featureName) => !subtree.includes(featureName));
}

export function getNode(rootNode, featureName) {
  let node=null
  for(const relation of rootNode.relations ?? []){
    for(const child of relation.children){
      if(child.name===featureName){
        return child
      }
      node=getNode(child,featureName)
      if(node){
        break
      }
    }
  }
  return node
}
export function getNodeMap(node, acum = new Map(), parent = null) {
  acum.set(node.name, {
    node,
    parent: parent?.name ?? null,
  });

  for (const relation of node.relations ?? []) {
    for (const child of relation.children ?? []) {
      getNodeMap(child, acum, node);
    }
  }

  return acum;
}
