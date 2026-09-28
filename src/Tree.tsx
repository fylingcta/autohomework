import type { CatalogNode } from '../shared/types';
export default function Tree({ nodes, selected, onSelect }: { nodes: CatalogNode[]; selected: string; onSelect: (id: string) => void }) {
  return <ul className="tree">{nodes.map(node => <li key={node.id}>{node.worksheetId ? <button className={`tree-leaf ${selected === node.worksheetId ? 'selected' : ''}`} onClick={() => onSelect(node.worksheetId!)} aria-current={selected === node.worksheetId ? 'page' : undefined}>▤ {node.label}</button> : <details open><summary>{node.label}</summary><Tree nodes={node.children ?? []} selected={selected} onSelect={onSelect} /></details>}</li>)}</ul>;
}
