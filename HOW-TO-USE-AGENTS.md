# How to Use Claude Code Agents - CORRECT METHOD

## The `/agents` Command

Claude Code has a special command for managing subagents:

```
/agents
```

This command allows you to:
- View all available subagents
- Create new subagents
- Edit existing subagents
- Manage subagent tools

## Checking Available Agents

1. Type `/agents` in Claude Code
2. You'll see a list of all agents in `.claude/agents/`
3. Each agent should show with its name and description

## Invoking Agents (Two Methods)

### Method 1: Explicit Invocation
Use this exact format with the `>` prefix:
```
> Use the ultra-short-content-creator subagent to write an article about AI
```

### Method 2: Natural Language
Simply describe what you need:
```
"Create an ultra-short article about quantum computing"
```
Claude will automatically select the appropriate agent based on descriptions.

## Testing the Pipeline

### Correct Way:
```
> Use the batch-orchestrator subagent to run a morning content batch
```

The orchestrator will then delegate to other agents:
```
> Use the trending-topics-discovery subagent to find topics
> Use the ultra-short-content-creator subagent to write articles
> Use the fact-checker subagent to verify accuracy
```

## Verifying Agents Work

When agents are properly invoked:
1. Their name appears in a colored box
2. They operate as separate entities
3. They have their own context and tools
4. You see clear delegation between agents

## Our Available Agents

1. **batch-orchestrator** - Orchestrates the content pipeline
2. **trending-topics-discovery** - Finds trending topics
3. **ultra-short-content-creator** - Creates 400-500 word articles
4. **fact-checker** - Verifies facts using WebSearch
5. **typography-enhancer** - Applies visual formatting
6. **quality-validator** - Ensures quality standards
7. **smart-content-linker** - Adds internal links
8. **publication-reviewer** - Final approval

## Example Commands

```
/agents                                              # View all agents
> Use the batch-orchestrator subagent to run a test batch
> Use the trending-topics-discovery subagent to find 5 tech topics
> Use the fact-checker subagent to verify the latest article
```

## Important Notes

- Agents must be in `.claude/agents/` folder
- Each agent needs proper YAML frontmatter
- Use the `>` prefix for explicit invocation
- The `/agents` command manages everything