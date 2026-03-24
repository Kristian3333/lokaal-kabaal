#!/bin/bash
# Desktop notification script for Claude Code hooks.
# Sends a notification when the agent needs attention or finishes a task.
#
# Usage: echo "message" | bash notify.sh
#   or:  bash notify.sh "Custom message"
#
# Works on Linux (notify-send), macOS (osascript), and WSL (powershell).

TITLE="Claude Code"

# Get message from argument or stdin
if [ -n "$1" ]; then
    MESSAGE="$1"
else
    MESSAGE=$(cat)
fi

# Default message if empty
if [ -z "$MESSAGE" ]; then
    MESSAGE="Agent needs your attention"
fi

# Try platform-specific notification
if command -v notify-send &>/dev/null; then
    # Linux
    notify-send "$TITLE" "$MESSAGE" 2>/dev/null
elif command -v osascript &>/dev/null; then
    # macOS
    osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\"" 2>/dev/null
elif command -v powershell.exe &>/dev/null; then
    # WSL / Windows
    powershell.exe -Command "
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null
        \$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        \$xml.LoadXml('<toast><visual><binding template=\"ToastText02\"><text id=\"1\">$TITLE</text><text id=\"2\">$MESSAGE</text></binding></visual></toast>')
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Claude Code').Show(\$xml)
    " 2>/dev/null
else
    # Fallback: just print to stderr
    echo "[$TITLE] $MESSAGE" >&2
fi
