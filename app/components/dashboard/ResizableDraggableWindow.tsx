import { useState, useEffect, useRef } from "react";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import RefreshIcon from "@mui/icons-material/Refresh";
import AdsClickIcon from "@mui/icons-material/AdsClick";
import { getFollowedPlayers, getFollowedTeams } from "@/firebase";

interface ResizableDraggableWindowProps {
  userId: string;
  type: string;
  sectionId: number;
}

const ResizableDraggableWindow: React.FC<ResizableDraggableWindowProps> = ({
  userId,
  type,
  sectionId,
}) => {
  const [data, setData] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState({ width: 300, height: 200 });

  const windowRef = useRef<HTMLDivElement>(null);
  const dragHandleRef = useRef<HTMLDivElement>(null);

  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    const fetchedData =
      type === "players"
        ? await getFollowedPlayers(userId)
        : await getFollowedTeams(userId);
    setData(fetchedData || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [userId, type]);

  // Handle drag
  const handleDrag = (e: React.MouseEvent) => {
    if (!sectionRef.current || !windowRef.current) return;

    const { left, top, width, height } =
      sectionRef.current.getBoundingClientRect();

    const offsetX = e.clientX - windowPosition.x;
    const offsetY = e.clientY - windowPosition.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newX = moveEvent.clientX - offsetX;
      const newY = moveEvent.clientY - offsetY;

      // Constrain movement to section boundaries
      const clampedX = Math.max(
        left,
        Math.min(newX, left + width - windowSize.width)
      );
      const clampedY = Math.max(
        top,
        Math.min(newY, top + height - windowSize.height)
      );

      setWindowPosition({ x: clampedX, y: clampedY });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Handle resize
  const handleResize = (e: React.MouseEvent) => {
    if (!sectionRef.current || !windowRef.current) return;

    const { left, top, width, height } =
      sectionRef.current.getBoundingClientRect();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = windowSize.width;
    const startHeight = windowSize.height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.max(
        200,
        Math.min(startWidth + moveEvent.clientX - startX, width)
      );
      const newHeight = Math.max(
        150,
        Math.min(startHeight + moveEvent.clientY - startY, height)
      );

      setWindowSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      ref={sectionRef}
      className="relative w-full h-full overflow-hidden"
      style={{ position: "relative" }}
    >
      <div
        ref={windowRef}
        className="bg-white shadow-lg rounded-lg p-4"
        style={{
          position: "absolute",
          top: windowPosition.y,
          left: windowPosition.x,
          width: windowSize.width,
          height: windowSize.height,
        }}
      >
        <div className="flex justify-between items-center">
          <div
            ref={dragHandleRef}
            onMouseDown={handleDrag}
            className="cursor-move text-gray-600"
          >
            <DragHandleIcon />
          </div>
          <div onClick={fetchData} className="cursor-pointer text-gray-600">
            <RefreshIcon />
          </div>
        </div>

        <div
          className="mt-4 text-sm"
          style={{ fontSize: `${Math.min(windowSize.width / 20, 16)}px` }}
        >
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <ul>
              {data.map((item, index) => (
                <li key={index} className="py-1">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className="absolute bottom-0 right-0 bg-gray-400 cursor-se-resize p-1"
          style={{ width: "15px", height: "15px" }}
          onMouseDown={handleResize}
        >
          <AdsClickIcon />
        </div>
      </div>
    </div>
  );
};

export default ResizableDraggableWindow;
