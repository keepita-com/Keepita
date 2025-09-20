GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
DIM='\033[2m'
NC='\033[0m'
TICK="[${GREEN}✓${NC}]"
CROSS="[${RED}✗${NC}]"
INFO="[${YELLOW}i${NC}]"
SKIP="[${BLUE}»${NC}]"
SPIN='|/-\'

BACKEND_PID=0
trap 'kill $BACKEND_PID 2>/dev/null && echo -e "\n${INFO} Backend server stopped." || echo -e "\n${INFO} Script terminated."; exit' INT TERM

run_task() {
    local description=$1
    shift
    local command_array=("$@")
    local log_file
    log_file=$(mktemp)

    printf "[ ] %s" "$description"
    "${command_array[@]}" > "$log_file" 2>&1 &
    local pid=$!
    local i=0
    while kill -0 $pid 2>/dev/null; do
        i=$(( (i+1) %4 ))
        printf "\r[%c] %s" "${SPIN:$i:1}" "$description"
        sleep 0.1
    done
    wait $pid
    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        printf "\r${TICK} %s\n" "$description"
    else
        printf "\r${CROSS} %s\n" "$description"
        echo -e "${DIM}"
        cat "$log_file"
        echo -e "${NC}"
        rm "$log_file"
        exit 1
    fi
    rm "$log_file"
}

check_prereq() {
    local cmd_name=$1
    local cmd=$2
    local url=$3
    printf "[ ] Checking for ${YELLOW}%s${NC}..." "$cmd_name"
    if ! command -v "$cmd" &> /dev/null; then
        printf "\r${CROSS} Checking for ${YELLOW}%s${NC}... Not found.\n" "$cmd_name"
        echo -e "    Please install ${YELLOW}${cmd_name}${NC} from: ${BLUE}${url}${NC}"
        exit 1
    fi
    printf "\r${TICK} Checking for ${YELLOW}%s${NC}... Found.\n" "$cmd_name"
}


clear
echo
echo "┌───────────────────────────────────────────────────┐"
echo "│  Welcome to the Simplified Xplorta Setup Script!  │"
echo "└───────────────────────────────────────────────────┘"
echo

echo "--- Checking Prerequisites ---"

PYTHON_CMD=""
if command -v "py" &> /dev/null && py -3 --version &> /dev/null; then
    PYTHON_CMD="py -3"
elif command -v "python3" &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v "python" &> /dev/null; then
    PYTHON_CMD="python"
fi

if [ -z "$PYTHON_CMD" ]; then
    printf "${CROSS} Could not find a valid Python command (tried py -3, python3, python).\n"
    exit 1
else
    printf "${TICK} Using Python command: ${YELLOW}%s${NC}\n" "$PYTHON_CMD"
fi

check_prereq "Node.js" "node" "https://nodejs.org/"
check_prereq "NPM" "npm" "https://nodejs.org/"
echo "-----------------------------------------------------"
echo

echo "--- Starting Backend Setup ---"
BACKEND_DIR="xplorta-backend"
VENV_DIR="${BACKEND_DIR}/venv"
PYTHON_EXEC="python"
PIP_EXEC="pip"

if [[ "$OSTYPE" == "cygwin" || "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    PYTHON_EXEC="${VENV_DIR}/Scripts/python.exe"
    PIP_EXEC="${VENV_DIR}/Scripts/pip.exe"
else
    PYTHON_EXEC="${VENV_DIR}/bin/python"
    PIP_EXEC="${VENV_DIR}/bin/pip"
fi

if [ -f "${PYTHON_EXEC}" ] && [ -f "${BACKEND_DIR}/.env" ]; then
    echo -e "${SKIP} Backend setup already found. Skipping installation."
else
    echo -e "${INFO} Backend setup incomplete or missing. Performing fresh installation..."
    if [ -d "${VENV_DIR}" ]; then
        run_task "Removing incomplete virtual environment" rm -rf "${VENV_DIR}"
    fi

    if [ ! -f "${BACKEND_DIR}/.env" ]; then
        printf "[ ] Creating backend .env file..."
        cat <<'EOF' > "${BACKEND_DIR}/.env"
SECRET_KEY=django-insecure-q0k=yj!f9ju+&@j!!bqgwd+m)$(ha73pj2xyr^g2hlp#5hnq!6
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
MAIN_SERVER_API_URL=https://api.xplorta.com/api/v1/dashboard/decrypt/
SELF_HOSTED_CALLBACK_URL=http://localhost:8000/api/v1/dashboard/decryption-callback/
MAIN_SERVER_API_KEY=
EOF
        printf "\r${TICK} Creating backend .env file\n"
        echo -e "${INFO} ${YELLOW}Note on MAIN_SERVER_API_KEY:${NC} This key is intentionally blank and will be auto-filled."
    fi

    run_task "Creating Python virtual environment" $PYTHON_CMD -m venv "${VENV_DIR}"
    run_task "Installing backend dependencies" "${PIP_EXEC}" install -r "${BACKEND_DIR}/requirements.txt"
fi

run_task "Applying database migrations" "${PYTHON_EXEC}" "${BACKEND_DIR}/manage.py" migrate

SUPERUSER_USERNAME='admin'
SUPERUSER_PASSWORD='password'
SUPERUSER_EMAIL='admin@example.com'
SUPERUSER_PY_CODE="from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(username='${SUPERUSER_USERNAME}').exists() or User.objects.create_superuser('${SUPERUSER_USERNAME}', '${SUPERUSER_EMAIL}', '${SUPERUSER_PASSWORD}')"
run_task "Creating Django superuser (if not exists)" "${PYTHON_EXEC}" "${BACKEND_DIR}/manage.py" shell -c "${SUPERUSER_PY_CODE}"

echo -e "${INFO} Starting backend server..."
"${PYTHON_EXEC}" "${BACKEND_DIR}/manage.py" runserver > backend.log 2>&1 &
BACKEND_PID=$!
sleep 3
echo -e "${TICK} Backend server is running (PID: $BACKEND_PID)"
echo "-----------------------------------------------------"
echo

echo "--- Starting Frontend Setup ---"
FRONTEND_DIR="xplorta-frontend"

if [ -d "${FRONTEND_DIR}/node_modules" ] && [ -f "${FRONTEND_DIR}/.env" ]; then
    echo -e "${SKIP} Frontend setup already found. Skipping installation."
else
    echo -e "${INFO} Frontend setup incomplete or missing. Performing fresh installation..."
    if [ -d "${FRONTEND_DIR}/node_modules" ]; then
        run_task "Removing old node_modules" rm -rf "${FRONTEND_DIR}/node_modules"
    fi

    if [ ! -f "${FRONTEND_DIR}/.env" ]; then
        printf "[ ] Creating frontend .env file..."
        cat <<'EOF' > "${FRONTEND_DIR}/.env"
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000
EOF
        printf "\r${TICK} Creating frontend .env file\n"
    fi

    (
        cd $FRONTEND_DIR || exit
        run_task "Installing frontend dependencies with npm" npm install
    )
fi

echo
echo "┌───────────────────────────────────────────────────┐"
echo "│  Setup complete! Starting the Xplorta server...   │"
echo "└───────────────────────────────────────────────────┘"
echo
echo -e "  Backend is running. You can log in with:"
echo -e "  ${INFO} Admin URL:    ${YELLOW}http://127.0.0.1:8000/admin${NC}"
echo -e "  ${INFO} Username:     ${YELLOW}${SUPERUSER_USERNAME}${NC}"
echo -e "  ${INFO} Password:     ${YELLOW}${SUPERUSER_PASSWORD}${NC}"
echo
echo -e "  Frontend will be available at:"
echo -e "  ${INFO} Frontend URL: ${YELLOW}http://localhost:5173${NC}"
echo
echo "[*] Starting frontend dev server... (Press CTRL+C to stop both servers)"
echo

(
    cd $FRONTEND_DIR || exit
    npm run dev
)