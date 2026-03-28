import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export interface KeywordRow {
    pattern_type: string;
    url_slug: string;
    page_title: string;
    target_keyword: string;
    search_intent: string;
    priority: string;
    estimated_pages_in_batch: string;
}

function getKeywordsData(): KeywordRow[] {
    // Navigate from src/lib back to project root, then into data folder
    const filePath = path.join(process.cwd(), 'data', 'keywords.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the CSV
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });
    
    return records as KeywordRow[];
}

export function getUseCasePages(): KeywordRow[] {
    const allKeywords = getKeywordsData();
    return allKeywords.filter((row: KeywordRow) => row.pattern_type === 'USE_CASE');
}

export function getUseCasePage(slug: string): KeywordRow | undefined {
    const allKeywords = getKeywordsData();
    return allKeywords.find(
        (row: KeywordRow) => row.pattern_type === 'USE_CASE' && row.url_slug === slug
    );
}
