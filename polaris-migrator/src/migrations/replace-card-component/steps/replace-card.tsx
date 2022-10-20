import type {ASTNode, Collection, JSCodeshift} from 'jscodeshift';

import {replaceJSXElement} from '../../../utilities/jsx';
import {
  addNewImportSpecifier,
  getImportSpecifierName,
  hasImportSpecifier,
  renameImportSpecifier,
  removeImportSpecifier,
} from '../../../utilities/imports';

/**
 * Replace <Card> with the <AlphaCard> component
 */
export function replaceCard<NodeType = ASTNode>(
  j: JSCodeshift,
  source: Collection<NodeType>,
  sourcePathRegex: RegExp,
) {
  if (hasImportSpecifier(j, source, 'AlphaCard', sourcePathRegex)) {
    removeImportSpecifier(j, source, 'Card', sourcePathRegex);
  } else {
    renameImportSpecifier(j, source, 'Card', 'AlphaCard', sourcePathRegex);
  }

  const localElementName =
    getImportSpecifierName(j, source, 'Card', sourcePathRegex) || 'Card';

  source.findJSXElements(localElementName).forEach((element) => {
    replaceJSXElement(j, element, 'AlphaCard');

    if (!hasImportSpecifier(j, source, 'AlphaStack', sourcePathRegex)) {
      addNewImportSpecifier(j, source, 'AlphaStack', sourcePathRegex);

      const AlphaStack = j.jsxElement(
        j.jsxOpeningElement(j.jsxIdentifier('AlphaStack')),
        j.jsxClosingElement(j.jsxIdentifier('AlphaStack')),
        element.node.children,
      );

      element.replace(
        j.jsxElement(element.node.openingElement, element.node.closingElement, [
          AlphaStack,
        ]),
      );
    }
  });
}
