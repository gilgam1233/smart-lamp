from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import viewsets, status, generics, permissions, request

from smart_lamp.models import User, SmartLamp
from smart_lamp.mqtt import publish_command
from smart_lamp.serializers import UserSerializer, SmartLampSerializer


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    @action(methods=['get', 'patch'], url_path='profile', detail=False,permission_classes=[IsAuthenticated])
    def current_user(self, request):
        u = request.user
        if request.method == 'GET':
            if u.is_authenticated:
                s = UserSerializer(u)
                return Response(s.data, status=status.HTTP_200_OK)

        if request.method == 'PATCH':
            s = UserSerializer(u, data=request.data, partial=True)
            if s.is_valid(raise_exception=True):
                s.save()
                return Response(s.data, status=status.HTTP_200_OK)
            return Response(s.errors, status=status.HTTP_400_BAD_REQUEST)

class SmartLampViewSet(viewsets.ViewSet,generics.ListAPIView):
    serializer_class = SmartLampSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SmartLamp.objects.filter(user=self.request.user)

    @action(methods=['post'], url_path='add', detail=False)
    def add_lamp(self, request):
        device_id = request.data.get('device_id')
        name = request.data.get('name', 'Đèn thông minh')

        if not device_id:
            return Response({"error": "Vui lòng cung cấp mã thiết bị."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 1. Tìm trong kho xem có tồn tại cái đèn phần cứng này không
            lamp = SmartLamp.objects.get(device_id=device_id)
        except SmartLamp.DoesNotExist:
            return Response({"error": "Mã thiết bị không hợp lệ hoặc không do chúng tôi sản xuất!"},
                            status=status.HTTP_404_NOT_FOUND)

        # 2. Kiểm tra xem đèn đã có chủ chưa
        if lamp.user is not None:
            if lamp.user == request.user:
                return Response({"error": "Bạn đã thêm thiết bị này vào ứng dụng rồi!"},
                                status=status.HTTP_400_BAD_REQUEST)
            return Response(
                {"error": "Thiết bị này đang được liên kết với một tài khoản khác. Vui lòng reset thiết bị!"},
                status=status.HTTP_400_BAD_REQUEST)

        # 3. Gán chủ mới cho đèn (Bind)
        lamp.user = request.user
        lamp.name = name
        lamp.save()

        serializer = self.get_serializer(lamp)
        return Response({
            "message": "Liên kết thiết bị thành công!",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    @action(methods=['delete'], url_path='remove', detail=True)
    def remove_lamp(self, request, pk=None):
        try:
            # Tự tay truy vấn bằng device_id dựa vào biến pk từ URL
            # Vẫn dùng get_queryset() để đảm bảo user chỉ được xóa đèn của chính mình
            lamp = self.get_queryset().get(device_id=pk)
        except SmartLamp.DoesNotExist:
            return Response({"error": "Không tìm thấy thiết bị hoặc bạn không có quyền xóa!"},
                            status=status.HTTP_404_NOT_FOUND)

        # Trả thiết bị về trạng thái vô chủ (Unbind) thay vì xóa hoàn toàn khỏi DB
        lamp.user = None
        lamp.name = "Đèn thông minh"  # (Tùy chọn) Reset lại tên gốc
        lamp.save()

        return Response({"message": "Đã xóa thiết bị khỏi tài khoản!"}, status=status.HTTP_200_OK)

    @action(methods=['patch'], url_path='rename', detail=True)
    def rename_lamp(self, request, pk=None):
        try:
            # Tự tay truy vấn bằng device_id thay vì dùng get_object()
            lamp = self.get_queryset().get(device_id=pk)
        except SmartLamp.DoesNotExist:
            return Response({"error": "Không tìm thấy đèn hoặc bạn không có quyền sửa!"},
                            status=status.HTTP_404_NOT_FOUND)

        new_name = request.data.get('name')

        if not new_name:
            return Response({"error": "Vui lòng cung cấp tên mới (name)."}, status=status.HTTP_400_BAD_REQUEST)

        lamp.name = new_name
        lamp.save()

        serializer = self.get_serializer(lamp)
        return Response({
            "message": "Đổi tên thiết bị thành công!",
            "data": serializer.data
        }, status=status.HTTP_200_OK)

    @action(methods=['post'], url_path='toggle', detail=False)
    def toggle_lamp(self, request):
        device_id = request.data.get('device_id')
        command = request.data.get('command')

        if not device_id or not command:
            return Response({"error": "Vui lòng cung cấp mã đèn (device_id) và lệnh (command)."},
                            status=status.HTTP_400_BAD_REQUEST)

        if not self.get_queryset().filter(device_id=device_id).exists():
            return Response({"error": "Không tìm thấy đèn của bạn!"}, status=status.HTTP_404_NOT_FOUND)

        publish_command(device_id, command)

        return Response({
            "message": f"Đã gửi lệnh {command} tới đèn {device_id}. Đang chờ phần cứng phản hồi...",
            "device_id": device_id
        }, status=status.HTTP_200_OK)